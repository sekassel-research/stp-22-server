import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, UpdateQuery } from 'mongoose';
import { EventService } from '../../event/event.service';
import { MemberService } from '../../member/member.service';
import { State } from './state.schema';

@Injectable()
export class StateService {
  constructor(
    @InjectModel('states') private model: Model<State>,
    private memberService: MemberService,
    private eventService: EventService,
  ) {
  }

  async findByGame(gameId: string): Promise<State | undefined> {
    return this.model.findOne({ gameId }).exec();
  }

  async createForGame(gameId: string): Promise<State | undefined> {
    const members = await this.memberService.findAll(gameId);
    try {
      const created = await this.model.create({
        gameId,
        expectedMoves: [{
          action: 'founding-roll',
          players: members.map(m => m.userId),
        }],
      });
      this.emit('created', created);
      return created;
    } catch (err) {
      if (err.code !== 11000) { // state already exists
        return undefined;
      }
      throw err;
    }
  }

  async update(gameId: string, dto: UpdateQuery<State>): Promise<State> {
    const updated = await this.model.findOneAndUpdate({ gameId }, dto, { new: true }).exec();
    updated && this.emit('updated', updated);
    return updated;
  }

  async deleteByGame(gameId: string): Promise<State | undefined> {
    const deleted = await this.model.findOneAndDelete({ gameId }).exec();
    deleted && this.emit('deleted', deleted);
    return deleted;
  }

  private emit(event: string, state: State) {
    this.memberService.findAll(state.gameId).then(members => {
      this.eventService.emit(`games.${state.gameId}.state.${event}`, state, members.map(m => m.userId));
    });
  }
}
