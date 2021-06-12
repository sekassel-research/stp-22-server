import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Types } from 'mongoose';
import { User } from '../../user/user.schema';
import { randInt } from '../shared/random';
import { State } from '../state/state.schema';
import { MoveDto } from './move.dto';
import { Move } from './move.schema';

@Injectable()
export class MoveService {
  constructor(
    private eventEmitter: EventEmitter2,
  ) {
  }

  async move(state: State, user: User, dto: MoveDto): Promise<Move | undefined> {
    const _id = new Types.ObjectId().toHexString();
    const result: Move = {
      ...dto,
      _id,
      userId: user._id,
      gameId: state.gameId,
    };

    switch (dto.action) {
      case 'founding-roll':
        const roll = randInt(6) + 1;
        result.roll = roll;
        break;
    }

    this.eventEmitter.emit(`games.${state.gameId}.moves.${_id}.created`, result); // TODO visibility
    return result;
  }
}
