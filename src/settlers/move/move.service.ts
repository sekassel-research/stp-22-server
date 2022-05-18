import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { EventService } from '../../event/event.service';
import { MemberService } from '../../member/member.service';
import { MoveDto } from './move.dto';
import { Move } from './move.schema';

@Injectable()
export class MoveService {
  constructor(
    @InjectModel('moves') private model: Model<Move>,
    private eventService: EventService,
    private memberService: MemberService,
  ) {
  }

  async findAll(gameId: string, filter: FilterQuery<Move> = {}): Promise<Move[]> {
    return this.model.find({ ...filter, gameId }).exec();
  }

  async findOne(gameId: string, id: string): Promise<Move | null> {
    return this.model.findById(id).exec();
  }

  async create(dto: MoveDto): Promise<Move> {
    const move = await this.model.create(dto);
    this.memberService.findAll(dto.gameId).then(members => { // can be async, no need for await
      this.eventService.emit(`games.${dto.gameId}.moves.${move._id}.created`, move, members.map(m => m.userId));
    });
    return move;
  }

  async deleteAll(gameId: string): Promise<void> {
    await this.model.deleteMany({ gameId }).exec();
  }
}
