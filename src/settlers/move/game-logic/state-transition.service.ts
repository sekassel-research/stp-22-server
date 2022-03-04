import { Injectable } from '@nestjs/common';
import { StateService } from 'src/settlers/state/state.service';
import { PlayerService } from '../../player/player.service';
import { ExpectedMove } from '../../state/state.schema';
import { Move } from '../move.schema';

@Injectable()
export class StateTransitionService {
  constructor(
    private stateService: StateService,
    private playerService: PlayerService,
  ) {
  }

  async transition(gameId: string, userId: string, move: Move) {
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
      if (move.roll === 7) {
        const allPlayers = await this.playerService.findAll(gameId);
        const players = allPlayers.filter(p => Object.values(p.resources).reduce((a, c) => a + c, 0) > 7);
        if (players.length) {
          const newMove: ExpectedMove = { action: 'drop', players: players.map(p => p.userId) };
          await this.stateService.update(gameId, {
            $push: { expectedMoves: { $each: [newMove], $position: 0 } },
            'expectedMoves.1.action': 'build',
          });
          return;
        }
      }
      await this.stateService.update(gameId, {
        'expectedMoves.0.action': 'build',
      });
      return;
    }

    if (move.action === 'founding-roll') {
      const players = await this.playerService.findAll(gameId, { foundingRoll: -1 });

      if (!players.find(p => !p.foundingRoll)) {
        const ids = players.map(m => m.userId);
        const reverseIds = ids.reverse();
        const expectedMoves: ExpectedMove[] = [
          ...ids.map(id => ({ action: 'founding-house-1', players: [id] }) as ExpectedMove),
          ...reverseIds.map(id => ({ action: 'founding-house-2', players: [id] }) as ExpectedMove),
          { action: 'founding-road-1', players: ids },
          { action: 'founding-road-2', players: ids },
          { action: 'roll', players: [ids[0]] },
        ];
        await this.stateService.update(gameId, {
          expectedMoves,
        });
        return;
      }
    }

    const state = await this.stateService.findByGame(gameId);
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
