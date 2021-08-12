import { Injectable } from '@nestjs/common';
import { CreateBuildingDto } from '../building/building.dto';
import { Building } from '../building/building.schema';
import { BuildingService } from '../building/building.service';
import { Map as GameMap, Tile } from '../map/map.schema';
import { MapService } from '../map/map.service';
import { Move } from '../move/move.schema';
import { PlayerService } from '../player/player.service';
import { BUILDING_COSTS, ResourceType, Task } from '../shared/constants';
import { Point3D } from '../shared/schema';
import { State } from '../state/state.schema';
import { StateService } from '../state/state.service';

@Injectable()
export class GameLogicService {
  constructor(
    private mapService: MapService,
    private stateService: StateService,
    private playerService: PlayerService,
    private buildingService: BuildingService,
  ) {
  }

  async handle(move: Move): Promise<void> {
    switch (move.action) {
      case 'founding-roll':
        return this.foundingRoll(move);
      case 'founding-house-1':
      case 'founding-house-2':
      case 'founding-streets':
      case 'build':
        return this.build(move);
      case 'roll':
        return this.roll(move);
    }
  }

  private async foundingRoll(move: Move): Promise<void> {
    const gameId = move.gameId;
    await this.playerService.update(gameId, move.userId, {
      foundingRoll: move.roll,
    });

    return this.advanceState(gameId, 'founding-house-1');
  }

  private async build(move: Move): Promise<void> {
    const { gameId, userId } = move;
    const $inc = {
      [`remainingBuildings.${move.building.type}s`]: -1,
    };

    if (move.action === 'build') {
      this.deductCosts(move, $inc);
    } else if (move.action === 'founding-house-1') {
      const map = await this.mapService.findByGame(gameId);
      this.giveAdjacentResources(map, move.building, $inc);
    }

    await this.playerService.update(gameId, userId, { $inc });

    // TODO check validity of building
    await this.buildingService.create({
      ...move.building,
      gameId,
      owner: userId,
    });

    return this.advanceState(gameId, {
      'founding-house-1': 'founding-house-2',
      'founding-house-2': 'founding-streets',
      'founding-streets': 'roll',
      'build': 'roll',
    }[move.action]);
  }

  private deductCosts(move: Move, $inc: { [p: string]: number }) {
    const costs = BUILDING_COSTS[move.building.type];
    for (const resource of Object.keys(costs)) {
      $inc[`resources.${resource}`] = -costs[resource];
    }
  }

  private giveAdjacentResources(map: GameMap, building: CreateBuildingDto, $inc: { [p: string]: number }) {
    const adjacentTilePositions = this.adjacentTileFilter(building);
    for (const tile of map.tiles) {
      if (!adjacentTilePositions.find(({ x, y, z }) => tile.x === x && tile.y === y && tile.z === z)) {
        continue;
      }

      if (tile.type === 'desert') {
        continue;
      }

      const key = `resources.${tile.type}`;
      const current = $inc[key] || 0;
      $inc[key] = current + 1;
    }
  }

  private async roll(move: Move): Promise<void> {
    const { gameId, roll } = move;
    const map = await this.mapService.findByGame(gameId);
    const tiles = map.tiles.filter(tile => tile.numberToken === roll);
    const players: Record<string, Partial<Record<ResourceType, number>>> = {};

    await Promise.all(tiles.map(tile => this.giveResources(players, tile)));
    await Promise.all(Object.keys(players).map(pid => this.updateResources(gameId, pid, players[pid])));

    return this.advanceState(gameId, 'build');
  }

  private async giveResources(players: Record<string, Partial<Record<ResourceType, number>>>, tile: Tile): Promise<void> {
    const adjacentBuildings = await this.buildingService.findAll({
      $or: this.adjacentBuildingFilter(tile),
    });
    for (const building of adjacentBuildings) {
      const resources = players[building.owner] ??= {};
      const resourceCount = resources[tile.type] || 0;
      switch (building.type) {
        case 'settlement':
          resources[tile.type] = resourceCount + 1;
          break;
        case 'city':
          resources[tile.type] = resourceCount + 2;
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
    const { x, y, z } = tile;
    return [
      { x, y, z, side: 0 }, // top
      { x: x + 1, y, z: z - 1, side: 1 }, // top right
      { x, y: y - 1, z: z + 1, side: 0 }, // bottom right
      { x, y, z, side: 1 }, // bottom
      { x: x - 1, y, z: z + 1, side: 0 }, // bottom left
      { x, y: y + 1, z: z - 1, side: 1 }, // top left
    ];
  }

  private adjacentTileFilter({ x, y, z, side, type }: Pick<Building, keyof Point3D | 'side' | 'type'>): Point3D[] {
    if (type === 'road') {
      switch (side) {
        case 0:
          return [
            { x, y, z },
            { x, y: y + 1, z: z - 1 },
          ];
        case 1:
          return [
            { x, y, z },
            { x: x - 1, y, z: z + 1 },
          ];
        case 2:
          return [
            { x, y, z },
            { x: x + 1, y: y - 1, z },
          ];
      }
    } else {
      switch (side) {
        case 0:
          return [
            { x, y, z },
            { x, y: y + 1, z: z - 1 },
            { x: x + 1, y, z: z - 1 },
          ];
        case 1:
          return [
            { x, y, z },
            { x: x - 1, y, z: z + 1 },
            { x, y: y - 1, z: z + 1 },
          ];
      }
    }
  }

  private async advanceState(gameId: string, next: Task): Promise<void> {
    const state = await this.stateService.findByGame(gameId);
    const stateUpdate: Partial<State> = {};
    if (state.nextPlayers.length === 0) {
      const players = await this.playerService.findAll(gameId);
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
