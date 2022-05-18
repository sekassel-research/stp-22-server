import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { UpdateQuery } from 'mongoose';
import { CreateBuildingDto } from '../../building/building.dto';
import { Building } from '../../building/building.schema';
import { BuildingService } from '../../building/building.service';
import { Map as GameMap } from '../../map/map.schema';
import { MapService } from '../../map/map.service';
import { Player, PlayerDocument, ResourceCount } from '../../player/player.schema';
import { PlayerService } from '../../player/player.service';
import { BUILDING_COSTS, BuildingType, ResourceType, TILE_RESOURCES } from '../../shared/constants';
import {
  cornerAdjacentCorners,
  cornerAdjacentCubes,
  cornerAdjacentEdges,
  edgeAdjacentCorners,
  edgeAdjacentCubes,
  edgeAdjacentEdges,
  Point3DWithCornerSide,
  Point3DWithEdgeSide,
} from '../../shared/hexagon';
import { Point3D } from '../../shared/schema';
import { CreateMoveDto } from '../move.dto';
import { Move } from '../move.schema';
import { MoveService } from '../move.service';

@Injectable()
export class BuildService {
  constructor(
    private mapService: MapService,
    private playerService: PlayerService,
    private buildingService: BuildingService,
    private moveService: MoveService,
  ) {
  }

  async build(gameId: string, userId: string, move: CreateMoveDto): Promise<Move> {
    this.checkExpectedType(move);

    const building = move.building ? await this.doBuild(gameId, userId, move) : undefined;

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
    this.checkResourceCosts(move.resources, player);

    const total = Object.values(player.resources).sum();
    const dropped = Object.values(move.resources).sum();
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
    const existing = await this.checkAllowedPlacement(gameId, userId, move);

    const update: UpdateQuery<Player> = {
      $inc: {
        [`remainingBuildings.${move.building.type}`]: -1,
      }
    };

    if (move.building.type === 'city') {
      update.$inc['remainingBuildings.settlement'] = +1;
    }
    if (move.building.type === 'road') {
      const longestRoad = await this.findLongestRoad(gameId, userId, move.building as Point3DWithEdgeSide);
      if (longestRoad >= 5) {
        const players = await this.playerService.findAll(gameId, userId);
        const bestPlayer = players.find(p => p.longestRoad);
        if (!bestPlayer || longestRoad > bestPlayer.longestRoad) {
          update.$inc.victoryPoints = +2;
          update.$set = {longestRoad};
        }
        if (bestPlayer && longestRoad >= bestPlayer.longestRoad) {
          await this.playerService.update(gameId, bestPlayer.userId, {
            $inc: { victoryPoints: -2 },
            $unset: { longestRoad: 1 },
          });
        }
      }
    } else {
      update.$inc.victoryPoints = +1;
    }

    if (move.action === 'build') {
      const player = await this.playerService.findOne(gameId, userId);
      const costs = BUILDING_COSTS[move.building.type];
      this.checkAvailableBuildings(player, move.building.type);
      this.checkResourceCosts(costs, player);
      this.deductCosts(costs, update.$inc);
    } else if (move.action === 'founding-settlement-2') {
      const map = await this.mapService.findByGame(gameId);
      this.giveAdjacentResources(map, move.building, update.$inc);
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
    const expectedType = {
      'founding-settlement-1': 'settlement',
      'founding-settlement-2': 'settlement',
      'founding-road-1': 'road',
      'founding-road-2': 'road',
    }[move.action];
    if (!expectedType) {
      return;
    }
    if (!move.building || move.building.type !== expectedType) {
      throw new ForbiddenException(`You need to build a ${expectedType}`);
    }
  }

  private async checkAllowedPlacement(gameId: string, userId: string, move: CreateMoveDto): Promise<Building | undefined> {
    switch (move.building.type) {
      case 'road':
        return this.checkRoadPlacement(gameId, userId, move.building);
      case 'settlement':
        return this.checkSettlementPlacement(gameId, userId, move);
      case 'city':
        return this.checkCityPlacement(gameId, userId, move.building);
    }
  }

  private async checkRoadPlacement(gameId: string, userId: string, building: CreateBuildingDto) {
    const existing = await this.buildingAt(gameId, building, ['road']);
    if (existing) {
      throw new ForbiddenException('There is already a road here');
    }
    const adjacentBuildings = await this.findRoadAdjacentBuildings(userId, building);
    if (adjacentBuildings.length <= 0) {
      throw new ForbiddenException('Needs to be connected to one of your buildings');
    }
    return undefined;
  }

  private async findRoadAdjacentBuildings(userId: string, building: CreateBuildingDto) {
    return this.buildingService.findAll({
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
    const existing = await this.buildingService.findAll({
      gameId,
      type: { $in: types },
      x, y, z, side,
    });
    return existing[0];
  }

  private async checkSettlementPlacement(gameId: string, userId: string, move: CreateMoveDto) {
    const building = move.building;
    const { x, y, z, side } = building;
    const adjacent = await this.buildingService.findAll({
      gameId,
      type: { $in: ['settlement', 'city'] },
      $or: [...cornerAdjacentCorners(building as Point3DWithCornerSide), { x, y, z, side }],
    });
    if (adjacent.length !== 0) {
      throw new ForbiddenException('Too close to another settlement or city');
    }

    if (move.action === 'build') {
      const adjacentRoads = await this.buildingService.findAll({
        gameId,
        owner: userId,
        type: 'road',
        $or: cornerAdjacentEdges(building as Point3DWithCornerSide),
      });
      if (adjacentRoads.length === 0) {
        throw new ForbiddenException('Needs to be connected to one of your roads');
      }
    }
    return undefined;
  }

  private checkAvailableBuildings(player: PlayerDocument, type: BuildingType) {
    if ((player.remainingBuildings[type] || 0) <= 0) {
      throw new ForbiddenException(`You can't build any more ${type}!`);
    }
  }

  private checkResourceCosts(costs: ResourceCount, player: PlayerDocument) {
    for (const key of Object.keys(costs)) {
      if ((player.resources[key] || 0) < costs[key]) {
        throw new ForbiddenException('You can\'t afford that!');
      }
    }
  }

  private deductCosts(costs: ResourceCount, $inc: Record<string, number>) {
    for (const resource of Object.keys(costs)) {
      $inc[`resources.${resource}`] = -costs[resource];
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
    const allRoads: Point3DWithEdgeSide[] = await this.buildingService.findAll({ gameId, owner: userId, type: 'road' }) as Point3DWithEdgeSide[];
    allRoads.push(start);

    let longestPath: Point3DWithEdgeSide[] = [];
    for (const path of this.dfs(allRoads, start, new Set(), [start])) {
      if (path.length >= longestPath.length) {
        longestPath = path;
      }
    }

    return longestPath.length;
  }

  private *dfs(roads: Point3DWithEdgeSide[], current: Point3DWithEdgeSide, seen: Set<Point3DWithEdgeSide>, path: Point3DWithEdgeSide[]) {
    seen.add(current);
    for (const a of edgeAdjacentEdges(current)) {
      const road = roads.find(r => r.x === a.x && r.y === a.y && r.z === a.z && r.side === a.side);
      if (!road || seen.has(road)) {
        continue;
      }

      const newPath = [...path, road];
      yield newPath;
      yield* this.dfs(roads, road, new Set(seen), newPath)
    }
  }
}
