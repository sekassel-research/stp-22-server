import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Types, UpdateQuery } from 'mongoose';
import { CreateBuildingDto } from '../../building/building.dto';
import { Building } from '../../building/building.schema';
import { BuildingService } from '../../building/building.service';
import { Map as GameMap } from '../../map/map.schema';
import { MapService } from '../../map/map.service';
import { Player, PlayerDocument, ResourceCount } from '../../player/player.schema';
import { PlayerService } from '../../player/player.service';
import { BUILDING_COSTS, BuildingType, ResourceType, Task, TILE_RESOURCES } from '../../shared/constants';
import {
  CORNER_SIDES,
  cornerAdjacentCorners,
  cornerAdjacentCubes,
  cornerAdjacentEdges,
  CornerSide,
  EDGE_SIDES,
  edgeAdjacentCorners,
  edgeAdjacentCubes,
  edgeAdjacentEdges,
  EdgeSide,
  Point3DWithCornerSide,
  Point3DWithEdgeSide,
} from '../../shared/hexagon';
import { Point3D } from '../../shared/schema';
import { CreateMoveDto } from '../move.dto';
import { Move } from '../move.schema';
import { MoveService } from '../move.service';
import { LongestRoadService } from './longest-road.service';

@Injectable()
export class BuildService {
  constructor(
    private mapService: MapService,
    private playerService: PlayerService,
    private buildingService: BuildingService,
    private moveService: MoveService,
    private longestRoadService: LongestRoadService,
  ) {
  }

  async build(gameId: string, userId: string, move: CreateMoveDto): Promise<Move> {
    this.checkExpectedType(move);

    const building = move.building ? await this.doBuild(gameId, userId, move) : undefined;

    if (!move.building) {
      // end of turn
      // unlock all development cards
      await this.playerService.update(gameId, userId, {
        $set: { 'developmentCards.$[].locked': false },
      });
    }

    return this.moveService.create({
      ...move,
      gameId,
      userId,
      building: building?._id?.toString(),
    });
  }

  async drop(gameId: string, userId: string, move: CreateMoveDto): Promise<Move> {
    if (!move.resources) {
      throw new BadRequestException('Missing resources property');
    }

    const player = await this.playerService.findOne(gameId, userId);
    if (!player) {
      throw new NotFoundException(userId);
    }

    this.checkResourceCosts(move.resources, player);

    const total = Object.values(player.resources).sum();
    const dropped = -Object.values(move.resources).sum();
    if (dropped !== ((total / 2) | 0)) {
      throw new ForbiddenException('You must drop exactly half of your resources (rounded down)');
    }

    const $inc: Partial<Record<`resources.${ResourceType}`, number>> = {};
    this.deductCosts(move.resources, $inc);
    await this.playerService.update(gameId, userId, { $inc });

    return this.moveService.create({
      ...move,
      gameId,
      userId,
      building: undefined,
    });
  }

  private async doBuild(gameId: string, userId: string, move: CreateMoveDto) {
    if (!move.building) {
      return;
    }

    const existing = await this.checkAllowedPlacement(gameId, userId, move);

    const update: UpdateQuery<Player> & {$inc: any} = {
      $inc: {
        [`remainingBuildings.${move.building.type}`]: -1,
      }
    };

    switch (move.building.type) {
      case 'road':
        await this.checkLongestRoad(gameId, userId, move.building, update);
        break;
      case 'settlement':
        update.$inc.victoryPoints = +1;
        await this.checkForBrokenRoad(gameId, userId, move.building, update);
        break;
      case 'city':
        update.$inc['remainingBuildings.settlement'] = +1;
        break;
    }

    if (move.action === 'build') {
      const player = await this.playerService.findOne(gameId, userId);
      if (!player) {
        throw new NotFoundException(userId);
      }

      const costs = BUILDING_COSTS[move.building.type];
      this.checkAvailableBuildings(player, move.building.type);
      this.checkResourceCosts(costs, player);
      this.deductCosts(costs, update.$inc);
    } else if (move.action === 'founding-settlement-2') {
      const map = await this.mapService.findByGame(gameId);
      map && this.giveAdjacentResources(map, move.building, update.$inc);
    }

    await this.playerService.update(gameId, userId, update);

    if (existing) {
      return this.buildingService.update(existing._id.toString(), {
        type: move.building.type,
      });
    }
    return this.buildingService.create(gameId, userId, move.building);
  }

  private async checkLongestRoad(gameId: string, userId: string, dto: CreateBuildingDto, update: UpdateQuery<Player> & {$inc: any}) {
    const longestRoad = await this.findLongestRoad(gameId, userId, dto, userId);
    update.longestRoad = longestRoad;
    if (longestRoad >= 5) {
      const bestPlayer = (await this.playerService.findAll(gameId, { hasLongestRoad: true }))[0];
      if (!bestPlayer) {
        // nobody had the longest road yet
        update.$inc.victoryPoints = +2;
        update.hasLongestRoad = true;
      } else if (bestPlayer.userId === userId) {
        // current player already has longest road
      } else if (longestRoad > (bestPlayer.longestRoad ?? 0)) {
        // take the title from the other player
        update.$inc.victoryPoints = +2;
        update.hasLongestRoad = true;
        await this.playerService.update(gameId, bestPlayer.userId, {
          $inc: { victoryPoints: -2 },
          hasLongestRoad: false,
        });
      }
    }
  }

  private async checkForBrokenRoad(gameId: string, userId: string, dto: CreateBuildingDto, update: UpdateQuery<Player> & {$inc: any}) {
    const adjacentEnemyRoads = await this.buildingService.findAll(gameId, {
      owner: { $ne: userId }, // can't break your own longest road
      type: 'road',
      $or: cornerAdjacentEdges(dto as Point3DWithCornerSide),
    });

    // NB: we only consider the case of 2 roads, because
    // - 1 road cannot be broken
    // - 3 roads would not allow someone else to build a settlement between them
    const ownerWith2Roads = adjacentEnemyRoads.find(b => adjacentEnemyRoads.countIf(b2 => b2.owner === b.owner) === 2)?.owner;
    if (!ownerWith2Roads) {
      return;
    }

    const longestRoad = await this.findLongestRoad(gameId, userId, dto, ownerWith2Roads);
    const players = await this.playerService.findAll(gameId);
    const playerWith2Roads = players.find(p => p.userId === ownerWith2Roads);
    if (!playerWith2Roads) {
      // for some reason the player no longer exists -- whatever
      return;
    }

    // Special Case: If your longest road is broken and you are
    // tied for longest road, you still keep the "Longest Road" card. (1)
    // However, if you no longer have the longest road, but two or
    // more players tie for the new longest road (2), set the "Longest
    // Road' card aside. Do the same if no one has a 5+ segment
    // road. The "Longest Road' card comes into play again when only
    // 1 player has the longest road (of at least 5 road pieces).

    const newLongestRoad = players.maxBy(p => p === playerWith2Roads ? longestRoad : p.longestRoad ?? 0).longestRoad ?? 0;
    if (!playerWith2Roads.hasLongestRoad || longestRoad === newLongestRoad) {
      // they did not have the longest road before, or they still have the longest road (1)
      await this.playerService.update(gameId, ownerWith2Roads, {
        longestRoad,
      });
      return;
    }

    // old player loses the title
    await this.playerService.update(gameId, ownerWith2Roads, {
      longestRoad,
      hasLongestRoad: false,
      $inc: {victoryPoints: -2},
    })

    const newPlayersWithLongestRoad = players.filter(p => p.longestRoad === newLongestRoad);
    if (newPlayersWithLongestRoad.length !== 1 || newLongestRoad < 5) {
      // tie for the new longest road, or not even eligible for the title (2)
      return;
    }

    // new player gets the title
    const newBestPlayerId = newPlayersWithLongestRoad[0].userId;
    if (newBestPlayerId === userId) {
      // the current user can be updated with the primary update
      update.hasLongestRoad = true;
      update.$inc.victoryPoints = +2;
    } else {
      await this.playerService.update(gameId, newBestPlayerId, {
        hasLongestRoad: true,
        $inc: { victoryPoints: +2 },
      });
    }
    return;
  }

  private checkExpectedType(move: CreateMoveDto) {
    const expectedType = ({
      'founding-settlement-1': 'settlement',
      'founding-settlement-2': 'settlement',
      'founding-road-1': 'road',
      'founding-road-2': 'road',
    } as Partial<Record<Task, BuildingType>>)[move.action];
    if (!expectedType) {
      return;
    }
    if (!move.building || move.building.type !== expectedType) {
      throw new ForbiddenException(`You need to build a ${expectedType}`);
    }
  }

  private async checkAllowedPlacement(gameId: string, userId: string, move: CreateMoveDto): Promise<Building | undefined> {
    switch (move.building?.type) {
      case 'road':
        return this.checkRoadPlacement(gameId, userId, move.action, move.building);
      case 'settlement':
        return this.checkSettlementPlacement(gameId, userId, move);
      case 'city':
        return this.checkCityPlacement(gameId, userId, move.building);
    }
  }

  private async checkRoadPlacement(gameId: string, userId: string, action: Task, building: CreateBuildingDto) {
    if (!EDGE_SIDES.includes(building.side as EdgeSide)) {
      throw new BadRequestException('Invalid edge side ' + building.side);
    }
    const existing = await this.buildingAt(gameId, building, ['road']);
    if (existing) {
      throw new ForbiddenException('There is already a road here');
    }

    if (action === 'founding-road-2') {
      const adjacentSettlements = await this.buildingService.findAll(gameId, {
        owner: userId,
        type: 'settlement',
        $or: edgeAdjacentCorners(building as Point3DWithEdgeSide),
      });
      if (!adjacentSettlements.length) {
        throw new ForbiddenException('There is no settlement adjacent to this road');
      }

      const adjacentRoads = await this.findAdjacentRoads(gameId, userId, adjacentSettlements[0] as Point3DWithCornerSide);
      if (adjacentRoads.length) {
        throw new ForbiddenException('The settlement is already connected to a road');
      }

      return undefined;
    }

    const adjacentBuildings = await this.findRoadAdjacentBuildings(gameId, userId, building);
    if (adjacentBuildings.length <= 0) {
      throw new ForbiddenException('Needs to be connected to one of your buildings');
    }
    return undefined;
  }

  private async findRoadAdjacentBuildings(gameId: string, userId: string, building: CreateBuildingDto) {
    return this.buildingService.findAll(gameId, {
      owner: userId,
      $or: [
        {
          type: 'road',
          $or: edgeAdjacentEdges(building as Point3DWithEdgeSide),
        },
        {
          type: { $in: ['settlement', 'city'] },
          $or: edgeAdjacentCorners(building as Point3DWithEdgeSide),
        },
      ],
    });
  }

  private async checkCityPlacement(gameId: string, userId: string, building: CreateBuildingDto) {
    const existing = await this.buildingAt(gameId, building, ['settlement', 'city']);
    if (!existing) {
      throw new ForbiddenException('There needs to be a settlement first');
    } else if (existing.type === 'city') {
      throw new ForbiddenException('There is already a city here');
    } else if (existing.owner !== userId) {
      throw new ForbiddenException('You need to be the owner of this settlement');
    }
    return existing;
  }

  private async buildingAt(gameId: string, building: CreateBuildingDto, types: BuildingType[]): Promise<Building | undefined> {
    const { x, y, z, side } = building;
    const existing = await this.buildingService.findAll(gameId, {
      type: { $in: types },
      x, y, z, side,
    });
    return existing[0];
  }

  private async checkSettlementPlacement(gameId: string, userId: string, move: CreateMoveDto) {
    const building = move.building;
    if (!building) {
      return;
    }

    const { x, y, z, side } = building;
    if (!CORNER_SIDES.includes(side as CornerSide)) {
      throw new BadRequestException('Invalid corner side ' + side);
    }

    const adjacent = await this.buildingService.findAll(gameId, {
      type: { $in: ['settlement', 'city'] },
      $or: [...cornerAdjacentCorners(building as Point3DWithCornerSide), { x, y, z, side }],
    });
    if (adjacent.length !== 0) {
      throw new ForbiddenException('Too close to another settlement or city');
    }

    if (move.action === 'build') {
      const adjacentRoads = await this.findAdjacentRoads(gameId, userId, building as Point3DWithCornerSide);
      if (adjacentRoads.length === 0) {
        throw new ForbiddenException('Needs to be connected to one of your roads');
      }
    }
    return undefined;
  }

  private findAdjacentRoads(gameId: string, userId: string, building: Point3DWithCornerSide): Promise<Building[]> {
    return this.buildingService.findAll(gameId, {
      owner: userId,
      type: 'road',
      $or: cornerAdjacentEdges(building),
    });
  }

  private checkAvailableBuildings(player: PlayerDocument, type: BuildingType) {
    if (!player) {
      return;
    }

    if ((player.remainingBuildings[type] || 0) <= 0) {
      throw new ForbiddenException(`You can't build any more ${type}!`);
    }
  }

  checkResourceCosts(costs: ResourceCount, player: PlayerDocument) {
    for (const key of Object.keys(costs) as ResourceType[]) {
      if ((player.resources[key] || 0) < -(costs[key] || 0)) {
        throw new ForbiddenException('You can\'t afford that!');
      }
    }
  }

  deductCosts(costs: ResourceCount, $inc: Record<string, number>) {
    for (const resource of Object.keys(costs) as ResourceType[]) {
      const count = costs[resource];
      count && ($inc[`resources.${resource}`] = count);
    }
  }

  private giveAdjacentResources(map: GameMap, building: CreateBuildingDto, $inc: Record<string, number>) {
    const adjacentTilePositions = this.adjacentTileFilter(building);
    for (const tile of map.tiles) {
      if (!adjacentTilePositions.find(({ x, y, z }) => tile.x === x && tile.y === y && tile.z === z)) {
        continue;
      }

      if (tile.type === 'desert') {
        continue;
      }

      const key = `resources.${TILE_RESOURCES[tile.type]}` as const;
      const current = $inc[key] || 0;
      $inc[key] = current + 1;
    }
  }

  private adjacentTileFilter(building: Pick<Building, keyof Point3D | 'side' | 'type'>): Point3D[] {
    if (building.type === 'road') {
      return edgeAdjacentCubes(building as Point3DWithEdgeSide);
    } else {
      return cornerAdjacentCubes(building as Point3DWithCornerSide);
    }
  }

  /**
   * @param gameId
   * @param userId the user who is building
   * @param dto the new building
   * @param owner the owner to find the longest road of
   * @private
   */
  private async findLongestRoad(gameId: string, userId: string, dto: CreateBuildingDto, owner: string): Promise<number> {
    const buildings: Building[] = await this.buildingService.findAll(gameId);
    const newBuilding: Building = {
      ...dto,
      _id: new Types.ObjectId,
      owner: userId,
      gameId,
    };
    buildings.push(newBuilding);
    return this.longestRoadService.findLongestRoad(buildings, owner);
  }
}
