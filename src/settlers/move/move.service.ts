import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { EventService } from '../../event/event.service';
import { MemberService } from '../../member/member.service';
import { MoveDto } from './move.dto';
import { Move } from './move.schema';

@Injectable()
export class MoveService {
  constructor(
    private eventService: EventService,
    private memberService: MemberService,
  ) {
  }

  async create(dto: MoveDto): Promise<Move> {
    const _id = new Types.ObjectId().toHexString();
    const result: Move = {
      ...dto,
      _id,
      createdAt: new Date(),
    };

    this.memberService.findAll(dto.gameId).then(members => { // can be async, no need for await
      this.eventService.emit(`games.${dto.gameId}.moves.${_id}.created`, members.map(m => m.userId));
    });
    return result;
  }
}
