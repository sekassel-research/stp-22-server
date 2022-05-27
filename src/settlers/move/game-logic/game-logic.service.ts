import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { StateService } from '../../state/state.service';
import { CreateMoveDto } from '../move.dto';
import { Move } from '../move.schema';
import { BuildService } from './build.service';
import { RollService } from './roll.service';
import { StateTransitionService } from './state-transition.service';

@Injectable()
export class GameLogicService {
  constructor(
    private stateService: StateService,
    private transitionService: StateTransitionService,
    private rollService: RollService,
    private buildService: BuildService,
  ) {
  }

  async handle(gameId: string, userId: string, move: CreateMoveDto): Promise<Move> {
    const state = await this.stateService.findByGame(gameId);
    if (!state) {
      throw new NotFoundException(gameId);
    }
    if (!state.expectedMoves[0].players.includes(userId)) {
      throw new ForbiddenException('Not your turn!');
    }
    if (state.expectedMoves[0].action !== move.action) {
      throw new ForbiddenException('You\'re not supposed to do that!');
    }

    const result = await this.doMove(move, gameId, userId);
    await this.transitionService.transition(gameId, userId, move);
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
      case 'build':
        return this.buildService.build(gameId, userId, move);
      case 'roll':
        return this.rollService.roll(gameId, userId, move);
    }
  }
}
