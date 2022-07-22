import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { UpdateQuery } from 'mongoose';
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
      building: building?._id,
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

    if (move.building.type === 'city') {
      update.$inc['remainingBuildings.settlement'] = +1;
    }
    if (move.building.type === 'road') {
      const longestRoad = await this.findLongestRoad(gameId, userId, move.building as Point3DWithEdgeSide);
      update.$max = {longestRoad};
      if (longestRoad >= 5) {
        const players = await this.playerService.findAll(gameId);
        const bestPlayer = players.length ? players.maxBy(p => p.longestRoad ?? 0) : undefined;
        if (bestPlayer && bestPlayer.userId === userId && bestPlayer.longestRoad) {
          // grant victory points only if not previous owner of longest road
          if (bestPlayer.longestRoad < 5) {
            update.$inc.victoryPoints = +2;
          }
        } else {
          if (!bestPlayer || longestRoad > (bestPlayer.longestRoad || 0)) {
            update.$inc.victoryPoints = +2;
          }
          if (bestPlayer && longestRoad >= (bestPlayer.longestRoad || 0)) {
            await this.playerService.update(gameId, bestPlayer.userId, {
              $inc: { victoryPoints: -2 },
            });
          }
        }
      }
    } else {
      update.$inc.victoryPoints = +1;
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
      return this.buildingService.update(existing._id, {
        type: move.building.type,
      });
    }
    return this.buildingService.create(gameId, userId, move.building);
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

  private async findLongestRoad(gameId: string, userId: string, start: Point3DWithEdgeSide): Promise<number> {
    const allRoads: Point3DWithEdgeSide[] = await this.buildingService.findAll(gameId, { owner: userId, type: 'road' }) as Point3DWithEdgeSide[];
    allRoads.push(start);
    return this.longestRoadService.findLongestRoad(allRoads, start);
  }
}
