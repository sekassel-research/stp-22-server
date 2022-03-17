import { ForbiddenException, Injectable } from '@nestjs/common';
import { StateService } from '../../state/state.service';
import { CreateMoveDto } from '../move.dto';
import { Move } from '../move.schema';
import { BuildService } from './build.service';
import { RollService } from './roll.service';
import { StateTransitionService } from './state-transition.service';
import { TradeService } from './trade.service';

@Injectable()
export class GameLogicService {
  constructor(
    private stateService: StateService,
    private transitionService: StateTransitionService,
    private rollService: RollService,
    private buildService: BuildService,
    private tradeService: TradeService,
  ) {
  }

  async handle(gameId: string, userId: string, move: CreateMoveDto): Promise<Move> {
    const state = await this.stateService.findByGame(gameId);
    if (!state) {
      return undefined;
    }
    if (!state.expectedMoves[0].players.includes(userId)) {
      throw new ForbiddenException('Not your turn!');
    }
    if (state.expectedMoves[0].action !== move.action) {
      throw new ForbiddenException('You\'re not supposed to do that!');
    }

    const result = await this.doMove(move, gameId, userId);
    await this.transitionService.transition(gameId, userId, result);
    return result;
  }

  private async doMove(move: CreateMoveDto, gameId: string, userId: string): Promise<Move> {
    switch (move.action) {
      case 'founding-roll':
        return this.rollService.foundingRoll(gameId, userId, move);
      case 'founding-house-1':
      case 'founding-house-2':
      case 'founding-road-1':
      case 'founding-road-2':
      case 'build':
        if (move.trade) {
          return this.tradeService.trade(gameId, userId, move);
        }
        return this.buildService.build(gameId, userId, move);
      case 'roll':
        return this.rollService.roll(gameId, userId, move);
      case 'drop':
        return this.buildService.drop(gameId, userId, move);
      case 'rob':
        return this.rollService.rob(gameId, userId, move);
      case 'trade':
        return this.tradeService.trade(gameId, userId, move);
    }
  }
}
