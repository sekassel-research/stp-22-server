import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { StateService } from '../../state/state.service';
import { CreateMoveDto } from '../move.dto';
import { Move } from '../move.schema';
import { BuildService } from './build.service';
import { DevelopmentService } from './development.service';
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
    private developmentService: DevelopmentService,
  ) {
  }

  async handle(gameId: string, userId: string, move: CreateMoveDto): Promise<Move> {
    const state = await this.stateService.findByGame(gameId);
    if (!state) {
      throw new NotFoundException(gameId);
    }
    const expectedMove = state.expectedMoves[0];
    if (!expectedMove) {
      throw new ForbiddenException('Nobody\'s turn :\'(');
    }
    if (!expectedMove.players.includes(userId)) {
      throw new ForbiddenException('Not your turn!');
    }
    if (expectedMove.action !== move.action) {
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
      case 'founding-settlement-1':
      case 'founding-settlement-2':
      case 'founding-road-1':
      case 'founding-road-2':
      case 'build-road':
      case 'build':
        if (move.resources) {
          return this.tradeService.buildTrade(gameId, userId, move);
        }
        if (move.developmentCard) {
          return this.developmentService.develop(gameId, userId, move);
        }
        return this.buildService.build(gameId, userId, move);
      case 'roll':
        return this.rollService.roll(gameId, userId, move);
      case 'drop':
        return this.buildService.drop(gameId, userId, move);
      case 'rob':
        return this.rollService.rob(gameId, userId, move);
      case 'offer':
        return this.tradeService.offer(gameId, userId, move);
      case 'accept':
        return this.tradeService.accept(gameId, userId, move);
      case 'monopoly':
        return this.developmentService.monopoly(gameId, userId, move);
      case 'year-of-plenty':
        return this.developmentService.yearOfPlenty(gameId, userId, move);
    }
  }
}
