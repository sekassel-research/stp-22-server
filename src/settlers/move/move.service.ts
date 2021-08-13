import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { EventService } from '../../event/event.service';
import { MoveDto } from './move.dto';
import { Move } from './move.schema';

@Injectable()
export class MoveService {
  constructor(
    private eventService: EventService,
  ) {
  }

  async create(dto: MoveDto): Promise<Move> {
    const _id = new Types.ObjectId().toHexString();
    const result: Move = {
      ...dto,
      _id,
    };

    this.eventService.emit(`games.${dto.gameId}.moves.${_id}.created`, result); // TODO visibility
    return result;
  }
}
