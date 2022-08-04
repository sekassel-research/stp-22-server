import { Injectable } from '@nestjs/common';
import { StateService } from 'src/settlers/state/state.service';
import { GameService } from '../../../game/game.service';
import { PlayerService } from '../../player/player.service';
import { DEFAULT_VICTORY_POINTS, DEVELOPMENT_ACTION } from '../../shared/constants';
import { ExpectedMove } from '../../state/state.schema';
import { BANK_TRADE_ID, Move } from '../move.schema';

@Injectable()
export class StateTransitionService {
  constructor(
    private stateService: StateService,
    private playerService: PlayerService,
    private gameService: GameService,
  ) {
  }

  async transition(gameId: string, userId: string, move: Move): Promise<void> {
    const players = await this.playerService.findAll(gameId, { active: { $ne: false } }, { foundingRoll: -1 });
    const victoryPoints = (await this.gameService.findOne(gameId))?.settings?.victoryPoints ?? DEFAULT_VICTORY_POINTS;
    const winner = players.find(p => (p.victoryPoints ?? 0) >= victoryPoints);
    if (winner) {
      await this.stateService.update(gameId, {
        expectedMoves: [],
        winner: winner.userId,
      });
      return;
    }

    if (move.action === 'build') {
      if (move.resources) {
        if (move.partner !== BANK_TRADE_ID) {
          return this.addOfferAndAccept(gameId, userId, move.partner);
        }
        return;
      }
      if (move.building) {
        return;
      }
      if (move.developmentCard) {
        if (move.developmentCard === 'new') {
          return;
        }
        const nextMoves: ExpectedMove[] = DEVELOPMENT_ACTION[move.developmentCard].map(action => ({
          action,
          players: [userId],
        }));
        nextMoves.length && await this.stateService.update(gameId, {
          $push: {
            expectedMoves: {
              $position: 0,
              $each: nextMoves,
            },
          },
        });
        return;
      }

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
        const dropPlayers = players.filter(p => Object.values(p.resources).sum() > 7);
        const expectedMoves: ExpectedMove[] = [
          { action: 'rob', players: [userId] },
          { action: 'build', players: [userId] },
        ];
        if (dropPlayers.length) {
          expectedMoves.splice(0, 0, { action: 'drop', players: dropPlayers.map(p => p.userId) });
        }
        await this.stateService.update(gameId, {
          expectedMoves,
        });
        return;
      }
      await this.stateService.update(gameId, {
        'expectedMoves.0.action': 'build',
      });
      return;
    }

    if (move.action === 'founding-roll') {
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

    await this.advanceSimple(gameId, userId);
  }

  private async addOfferAndAccept(gameId: string, userId: string, partner?: string): Promise<void> {
    const othersOffer: ExpectedMove = {
      action: 'offer',
      players: partner ? [partner] : (await this.playerService.findAll(gameId, {
        active: { $ne: false },
        userId: { $ne: userId },
      })).map(o => o.userId),
    };
    const playerAccepts: ExpectedMove = {
      action: 'accept',
      players: [userId],
    };
    await this.stateService.update(gameId, {
      $push: {
        expectedMoves: {
          $position: 0,
          $each: [
            othersOffer,
            playerAccepts,
          ],
        },
      },
    });
  }

  async advanceSimple(gameId: string, userId: string) {
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
