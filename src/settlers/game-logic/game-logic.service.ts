import { Injectable } from '@nestjs/common';
import { BuildingService } from '../building/building.service';
import { Move } from '../move/move.schema';
import { PlayerService } from '../player/player.service';
import { Task } from '../shared/constants';
import { State } from '../state/state.schema';
import { StateService } from '../state/state.service';

@Injectable()
export class GameLogicService {
  constructor(
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
    await this.playerService.update(gameId, userId, {
      $inc: {
        [`remainingBuildings.${move.building.type}s`]: -1,
      },
    });

    // TODO check validity of building
    await this.buildingService.create({
      ...move.building,
      gameId,
      owner: userId,
    });

    // TODO deduct costs in 'building' phase

    return this.advanceState(gameId, {
      'founding-house-1': 'founding-house-2',
      'founding-house-2': 'founding-streets',
      'founding-streets': 'roll',
      'build': 'roll',
    }[move.action]);
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
