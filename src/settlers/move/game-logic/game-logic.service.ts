import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateBuildingDto } from '../../building/building.dto';
import { Building } from '../../building/building.schema';
import { BuildingService } from '../../building/building.service';
import { Map as GameMap, Tile } from '../../map/map.schema';
import { MapService } from '../../map/map.service';
import { PlayerService } from '../../player/player.service';
import { BUILDING_COSTS, BuildingType, ResourceType, Task, TILE_RESOURCES } from '../../shared/constants';
import {
  cornerAdjacentCorners,
  cornerAdjacentCubes,
  cornerAdjacentEdges,
  cubeCorners,
  edgeAdjacentCubes,
  Point3DWithCornerSide,
  Point3DWithEdgeSide,
} from '../../shared/hexagon';
import { randInt } from '../../shared/random';
import { Point3D } from '../../shared/schema';
import { State } from '../../state/state.schema';
import { StateService } from '../../state/state.service';
import { CreateMoveDto } from '../move.dto';
import { Move } from '../move.schema';
import { MoveService } from '../move.service';

@Injectable()
export class GameLogicService {
  constructor(
    private mapService: MapService,
    private stateService: StateService,
    private playerService: PlayerService,
    private buildingService: BuildingService,
    private moveService: MoveService,
  ) {
  }

  async handle(gameId: string, userId: string, move: CreateMoveDto): Promise<Move> {
    const state = await this.stateService.findByGame(gameId);
    if (!state) {
      return undefined;
    }
    if (state.activePlayer !== userId) {
      throw new ForbiddenException('Not your turn!');
    }
    if (state.activeTask !== move.action) {
      throw new ForbiddenException('You\'re not supposed to do that!');
    }

    switch (move.action) {
      case 'founding-roll':
        return this.foundingRoll(gameId, userId, move);
      case 'founding-house-1':
      case 'founding-house-2':
      case 'founding-road-1':
      case 'founding-road-2':
      case 'build':
        return this.build(gameId, userId, move);
      case 'roll':
        return this.roll(gameId, userId, move);
    }
  }

  private async foundingRoll(gameId: string, userId: string, move: CreateMoveDto): Promise<Move> {
    const roll = this.d6();
    await this.playerService.update(gameId, userId, {
      foundingRoll: roll,
    });

    await this.advanceState(gameId, 'founding-house-1');
    return this.moveService.create({
      ...move,
      building: undefined,
      gameId,
      userId,
      roll,
    });
  }

  private d6(): number {
    return randInt(6) + 1;
  }

  private async build(gameId: string, userId: string, move: CreateMoveDto): Promise<Move> {
    this.checkExpectedType(move);

    let building: Building | undefined;
    if (move.building) {
      building = await this.doBuild(gameId, userId, move);
    } else {
      await this.advanceState(gameId, {
        'founding-house-1': 'founding-house-2',
        'founding-house-2': 'founding-streets',
        'founding-road-1': 'founding-road-2',
        'founding-road-2': 'roll',
        'build': 'roll',
      }[move.action], {
        'founding-house-1': { foundingRoll: -1 },
        'founding-house-2': { foundingRoll: 1 },
        'founding-road-1': { foundingRoll: -1 },
        'founding-road-2': { foundingRoll: 1 },
      }[move.action]);
    }

    return this.moveService.create({
      ...move,
      gameId,
      userId,
      building: building?._id,
    });
  }

  private async doBuild(gameId: string, userId: string, move: CreateMoveDto) {
    const existing = await this.checkAllowedPlacement(gameId, userId, move.building);

    const $inc: Partial<Record<`remainingBuildings.${BuildingType}` | `resources.${ResourceType}`, number>> = {
      [`remainingBuildings.${move.building.type}`]: -1,
    };

    if (move.action === 'build') {
      await this.checkCosts(gameId, userId, move.building);
      this.deductCosts(move, $inc);
    } else if (move.action === 'founding-house-1') {
      const map = await this.mapService.findByGame(gameId);
      this.giveAdjacentResources(map, move.building, $inc);
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
    const expectedType = {
      'founding-house-1': 'settlement',
      'founding-house-2': 'settlement',
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

  private async checkAllowedPlacement(gameId: string, userId: string, building: CreateBuildingDto): Promise<Building | undefined> {
    switch (building.type) {
      case 'road':
        return this.checkRoadPlacement(gameId, building);
      case 'settlement':
        return this.checkSettlementPlacement(gameId, userId, building);
      case 'city':
        return this.checkCityPlacement(gameId, userId, building);
    }
  }

  private async checkRoadPlacement(gameId: string, building: CreateBuildingDto) {
    const existing = await this.buildingAt(gameId, building, ['road']);
    if (existing) {
      throw new ForbiddenException('There is already a road here');
    }
    // TODO check connection to existing owned road or settlement
    return undefined;
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

  private async checkSettlementPlacement(gameId: string, userId: string, building: CreateBuildingDto) {
    const { x, y, z, side } = building;
    const adjacent = await this.buildingService.findAll({
      gameId,
      type: { $in: ['settlement', 'city'] },
      $or: [...cornerAdjacentCorners(building as Point3DWithCornerSide), { x, y, z, side }],
    });
    if (adjacent.length !== 0) {
      throw new ForbiddenException('Too close to another settlement or city');
    }
    const adjacentRoads = await this.buildingService.findAll({
      gameId,
      owner: userId,
      type: 'road',
      $or: cornerAdjacentEdges(building as Point3DWithCornerSide),
    });
    if (adjacentRoads.length === 0) {
      throw new ForbiddenException('Needs to be connected to one of your roads');
    }
    return undefined;
  }

  private async checkCosts(gameId: string, userId: string, building: CreateBuildingDto) {
    const player = await this.playerService.findOne(gameId, userId);
    if ((player.remainingBuildings[building.type] || 0) <= 0) {
      throw new ForbiddenException(`You can't build any more ${building.type}!`);
    }

    const costs = BUILDING_COSTS[building.type];

    for (const key of Object.keys(costs)) {
      if ((player.resources[key] || 0) < costs[key]) {
        throw new ForbiddenException('You can\'t afford that!');
      }
    }
  }

  private deductCosts(move: CreateMoveDto, $inc: Partial<Record<`resources.${ResourceType}`, number>>) {
    const costs = BUILDING_COSTS[move.building.type];
    for (const resource of Object.keys(costs)) {
      $inc[`resources.${resource}`] = -costs[resource];
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

  private async roll(gameId: string, userId: string, move: CreateMoveDto): Promise<Move> {
    const roll = this.d6() + this.d6();
    const map = await this.mapService.findByGame(gameId);
    const tiles = map.tiles.filter(tile => tile.numberToken === roll);
    const players: Record<string, Partial<Record<ResourceType, number>>> = {};

    await Promise.all(tiles.map(tile => this.giveResources(gameId, players, tile)));
    await Promise.all(Object.keys(players).map(pid => this.updateResources(gameId, pid, players[pid])));

    await this.stateService.update(gameId, {
      activeTask: 'build',
    });

    return this.moveService.create({
      ...move,
      building: undefined,
      gameId,
      userId,
      roll,
    });
  }

  private async giveResources(gameId: string, players: Record<string, Partial<Record<ResourceType, number>>>, tile: Tile): Promise<void> {
    if (tile.type === 'desert') {
      return;
    }

    const adjacentBuildings = await this.buildingService.findAll({
      gameId,
      $or: this.adjacentBuildingFilter(tile),
    });
    for (const building of adjacentBuildings) {
      const resources = players[building.owner] ??= {};
      const resourceType = TILE_RESOURCES[tile.type];
      const resourceCount = resources[resourceType] || 0;
      switch (building.type) {
        case 'settlement':
          resources[resourceType] = resourceCount + 1;
          break;
        case 'city':
          resources[resourceType] = resourceCount + 2;
          break;
      }
    }
  }

  private async updateResources(gameId: string, userId: string, resources: Partial<Record<string, number>>): Promise<void> {
    const $inc = {};
    for (const key of Object.keys(resources)) {
      $inc[`resources.${key}`] = resources[key];
    }
    await this.playerService.update(gameId, userId, { $inc });
  }

  private adjacentBuildingFilter(tile: Point3D): Pick<Building, keyof Point3D | 'side'>[] {
    return cubeCorners(tile);
  }

  private adjacentTileFilter(building: Pick<Building, keyof Point3D | 'side' | 'type'>): Point3D[] {
    if (building.type === 'road') {
      return edgeAdjacentCubes(building as Point3DWithEdgeSide);
    } else {
      return cornerAdjacentCubes(building as Point3DWithCornerSide);
    }
  }

  private async advanceState(gameId: string, next: Task, sort?: any): Promise<void> {
    const state = await this.stateService.findByGame(gameId);
    const stateUpdate: Partial<State> = {};
    if (state.nextPlayers.length === 0) {
      const players = await this.playerService.findAll(gameId, sort);
      const [first, ...rest] = players;
      stateUpdate.activeTask = next;
      stateUpdate.activePlayer = first.userId;
      stateUpdate.nextPlayers = rest.map(p => p.userId);
    } else {
      const [next, ...rest] = state.nextPlayers;
      stateUpdate.activePlayer = next;
      stateUpdate.nextPlayers = rest;
    }
    await this.stateService.update(gameId, stateUpdate);
  }
}
