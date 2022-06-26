import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { BuildingService } from '../../building/building.service';
import { Tile } from '../../map/map.schema';
import { MapService } from '../../map/map.service';
import { Player } from '../../player/player.schema';
import { PlayerService } from '../../player/player.service';
import { ResourceType, TILE_RESOURCES } from '../../shared/constants';
import { cubeCorners } from '../../shared/hexagon';
import { StateService } from '../../state/state.service';
import { CreateMoveDto } from '../move.dto';
import { Move } from '../move.schema';
import { MoveService } from '../move.service';

@Injectable()
export class RollService {
  constructor(
    private playerService: PlayerService,
    private moveService: MoveService,
    private mapService: MapService,
    private buildingService: BuildingService,
    private stateService: StateService,
  ) {
  }

  private d6(): number {
    return Math.randInt(6) + 1;
  }

  async foundingRoll(gameId: string, userId: string, move: CreateMoveDto): Promise<Move> {
    const roll = this.d6();
    await this.playerService.update(gameId, userId, {
      foundingRoll: roll,
    });

    return this.moveService.create({
      ...move,
      building: undefined,
      gameId,
      userId,
      roll,
    });
  }

  async roll(gameId: string, userId: string, move: CreateMoveDto): Promise<Move> {
    const roll = this.d6() + this.d6();
    if (roll === 7) {
      await this.roll7(gameId);
    } else {
      await this.rollResources(gameId, roll);
    }

    return this.moveService.create({
      ...move,
      building: undefined,
      gameId,
      userId,
      roll,
    });
  }

  private async roll7(gameId: string): Promise<void> {
    const players = await this.playerService.findAll(gameId, {active: false});
    await Promise.all(players.map(p => this.stealResources(p)));
  }

  private async stealResources(player: Player) {
    const resources = { ...player.resources };
    let total = Object.values(resources).sum();
    if (total <= 7) {
      return;
    }

    const keys = Object.keys(resources) as ResourceType[];
    const stealCount = Math.floor(total / 2);

    for (let i = 0; i < stealCount; i++) {
      let rand = Math.randInt(total);
      for (const key of keys) {
        const amount = resources[key];
        if (!amount) {
          continue;
        }

        if (rand >= amount) {
          rand -= amount;
          continue;
        }

        resources[key] = amount - 1;
        total--;
        break;
      }
    }

    await this.playerService.update(player.gameId, player.userId, {
      resources,
    });
  }


  async rob(gameId: string, userId: string, move: CreateMoveDto): Promise<Move> {
    if (!move.rob) {
      throw new BadRequestException('Missing rob property');
    }

    const { target: targetId, ...robber } = move.rob;

    if (targetId) {
      const target = await this.playerService.findOne(gameId, targetId);
      if (!target) {
        throw new NotFoundException(targetId);
      }

      const buildings = await this.buildingService.findAll(gameId, {
        owner: targetId,
        $or: cubeCorners(move.rob),
      });
      if (!buildings.length) {
        throw new ForbiddenException('The target player has no buildings adjacent to the tile');
      }

      const resources = Object.keys(target.resources).filter(k => target.resources[k as ResourceType]! > 0);
      if (!resources.length) {
        throw new BadRequestException('The target player has no resources');
      }

      const randomResource = resources[Math.randInt(resources.length)];
      await Promise.all([
        this.updateResources(gameId, targetId, { [randomResource]: -1 }),
        this.updateResources(gameId, userId, { [randomResource]: +1 }),
      ]);
    } else {
      const buildings = await this.buildingService.findAll(gameId, {
        owner: {$ne: userId},
        $or: cubeCorners(move.rob),
      });
      if (buildings.length) {
        throw new ForbiddenException('There are buildings adjacent to the tile - you must specify a target player');
      }
    }

    await this.stateService.update(gameId, { robber });
    return this.moveService.create({
      ...move,
      building: undefined,
      gameId,
      userId,
    });
  }

  private async rollResources(gameId: string, roll: number): Promise<void> {
    const state = await this.stateService.findByGame(gameId);
    if (!state) {
      return;
    }

    const map = await this.mapService.findByGame(gameId);
    if (!map) {
      return;
    }

    const { robber } = state;
    const tiles = map.tiles.filter(tile => tile.numberToken === roll && !(robber && tile.x === robber.x && tile.y === robber.y && tile.z === robber.z));
    const players: Record<string, Partial<Record<ResourceType, number>>> = {};

    await Promise.all(tiles.map(tile => this.giveResources(gameId, players, tile)));
    await Promise.all(Object.keys(players).map(pid => this.updateResources(gameId, pid, players[pid])));
  }

  private async giveResources(gameId: string, players: Record<string, Partial<Record<ResourceType, number>>>, tile: Tile): Promise<void> {
    if (tile.type === 'desert') {
      return;
    }

    const adjacentBuildings = await this.buildingService.findAll(gameId, {
      $or: cubeCorners(tile),
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
    const $inc: any = {};
    for (const key of Object.keys(resources)) {
      $inc[`resources.${key}`] = resources[key];
    }
    await this.playerService.update(gameId, userId, { $inc });
  }
}
