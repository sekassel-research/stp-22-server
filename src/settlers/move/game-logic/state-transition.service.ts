import { Injectable } from '@nestjs/common';
import { StateService } from 'src/settlers/state/state.service';
import { PlayerService } from '../../player/player.service';
import { Task } from '../../shared/constants';
import { State } from '../../state/state.schema';
import { CreateMoveDto } from '../move.dto';

const TRANSITIONS = {
  'founding-roll': 'founding-house-1',
  'founding-house-1': 'founding-house-2',
  'founding-house-2': 'founding-road-1',
  'founding-road-1': 'founding-road-2',
  'founding-road-2': 'roll',
  'build': 'roll',
} as const;

@Injectable()
export class StateTransitionService {
  constructor(
    private stateService: StateService,
    private playerService: PlayerService,
  ) {
  }

  async transition(gameId: string, move: CreateMoveDto) {
    if (move.action === 'build' && move.building) {
      return;
    }

    if (move.action === 'roll') {
      await this.stateService.update(gameId, {
        activeTask: 'build',
      });
      return;
    }

    const newTask = TRANSITIONS[move.action];
    await this.advanceState(gameId, newTask, {
      'founding-house-1': { foundingRoll: -1 },
      'founding-house-2': { foundingRoll: 1 },
      'founding-road-1': { foundingRoll: -1 },
      'founding-road-2': { foundingRoll: 1 },
    }[move.action]);
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
