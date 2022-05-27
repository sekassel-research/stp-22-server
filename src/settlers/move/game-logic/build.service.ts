import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateBuildingDto } from '../../building/building.dto';
import { Building } from '../../building/building.schema';
import { BuildingService } from '../../building/building.service';
import { Map as GameMap } from '../../map/map.schema';
import { MapService } from '../../map/map.service';
import { PlayerService } from '../../player/player.service';
import { BUILDING_COSTS, BuildingType, ResourceType, Task, TILE_RESOURCES } from '../../shared/constants';
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

  private async doBuild(gameId: string, userId: string, move: CreateMoveDto) {
    if (!move.building) {
      return;
    }

    const existing = await this.checkAllowedPlacement(gameId, userId, move);

    const $inc: Partial<Record<`remainingBuildings.${BuildingType}` | `resources.${ResourceType}`, number>> = {
      [`remainingBuildings.${move.building.type}`]: -1,
    };

    if (move.building.type === 'city') {
      $inc['remainingBuildings.settlement'] = +1;
    }

    if (move.action === 'build') {
      await this.checkCosts(gameId, userId, move.building);
      this.deductCosts(move.building, $inc);
    } else if (move.action === 'founding-settlement-2') {
      const map = await this.mapService.findByGame(gameId);
      map && this.giveAdjacentResources(map, move.building, $inc);
    }

    await this.playerService.update(gameId, userId, { $inc });

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
    if (!building) {
      return;
    }

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

  private async checkCosts(gameId: string, userId: string, building: CreateBuildingDto) {
    const player = await this.playerService.findOne(gameId, userId);
    if (!player) {
      return;
    }

    if ((player.remainingBuildings[building.type] || 0) <= 0) {
      throw new ForbiddenException(`You can't build any more ${building.type}!`);
    }

    const costs = BUILDING_COSTS[building.type];

    for (const key of Object.keys(costs) as ResourceType[]) {
      if ((player.resources[key] || 0) < (costs[key] || 0)) {
        throw new ForbiddenException('You can\'t afford that!');
      }
    }
  }

  private deductCosts(building: CreateBuildingDto, $inc: Partial<Record<`resources.${ResourceType}`, number>>) {
    const costs = BUILDING_COSTS[building.type];
    for (const resource of Object.keys(costs) as ResourceType[]) {
      const cost = costs[resource];
      cost && ($inc[`resources.${resource}`] = -cost);
    }
  }

  private giveAdjacentResources(map: GameMap, building: CreateBuildingDto, $inc: Partial<Record<`resources.${ResourceType}`, number>>) {
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
}
