import { Injectable } from '@nestjs/common';
import { StateService } from 'src/settlers/state/state.service';
import { PlayerService } from '../../player/player.service';
import { ExpectedMove } from '../../state/state.schema';
import { CreateMoveDto } from '../move.dto';

@Injectable()
export class StateTransitionService {
  constructor(
    private stateService: StateService,
    private playerService: PlayerService,
  ) {
  }

  async transition(gameId: string, userId: string, move: CreateMoveDto) {
    if (move.action === 'build') {
      if (move.building) {
        return;
      }

      const players = await this.playerService.findAll(gameId, { foundingRoll: -1 });
      const currentIndex = players.findIndex(p => p.userId === userId);
      const nextPlayer = players[(currentIndex + 1) % players.length];
      await this.stateService.update(gameId, {
        'expectedMoves.0.action': 'roll',
        'expectedMoves.0.players': [nextPlayer.userId],
      });
      return;
    }

    if (move.action === 'roll') {
      await this.stateService.update(gameId, {
        'expectedMoves.0.action': 'build',
      });
      return;
    }

    if (move.action === 'founding-roll') {
      const players = await this.playerService.findAll(gameId, { foundingRoll: -1 });

      if (!players.find(p => !p.foundingRoll)) {
        const ids = players.map(m => m.userId);
        const expectedMoves: ExpectedMove[] = [];
        for (const id of ids) {
          expectedMoves.push({ action: 'founding-settlement-1', players: [id] });
          expectedMoves.push({ action: 'founding-road-1', players: [id] });
        }
        for (const id of ids.reverse()) {
          expectedMoves.push({ action: 'founding-settlement-2', players: [id] });
          expectedMoves.push({ action: 'founding-road-2', players: [id] });
        }
        expectedMoves.push({ action: 'roll', players: [ids[0]] });
        await this.stateService.update(gameId, {
          expectedMoves,
        });
        return;
      }
    }

    const state = await this.stateService.findByGame(gameId);
    if (!state) {
      return;
    }

    const players = state.expectedMoves[0].players;
    if (players.length > 1) {
      await this.stateService.update(gameId, {
        $pull: { 'expectedMoves.0.players': userId },
      });
    } else if (players.length === 1) {
      await this.stateService.update(gameId, {
        $pop: { expectedMoves: -1 },
      });
    }
  }
}
