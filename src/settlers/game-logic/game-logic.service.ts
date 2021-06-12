import { Injectable } from '@nestjs/common';
import { Move } from '../move/move.schema';
import { PlayerService } from '../player/player.service';
import { State } from '../state/state.schema';
import { StateService } from '../state/state.service';

@Injectable()
export class GameLogicService {
  constructor(
    private stateService: StateService,
    private playerService: PlayerService,
  ) {
  }

  async handle(move: Move): Promise<void> {
    switch (move.action) {
      case 'founding-roll':
        return this.foundingRoll(move);
    }
  }

  private async foundingRoll(move: Move): Promise<void> {
    const gameId = move.gameId;
    await this.playerService.update(gameId, move.userId, {
      foundingRoll: move.roll,
    });

    const state = await this.stateService.findByGame(gameId);
    const stateUpdate: Partial<State> = {};
    if (state.nextPlayers.length === 0) {
      const players = await this.playerService.findAll(gameId);
      players.sort((a, b) => a.foundingRoll - b.foundingRoll);
      const [first, ...rest] = players;
      stateUpdate.activeTask = 'founding-house-1';
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
