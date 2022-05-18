import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, UpdateQuery } from 'mongoose';
import { EventService } from '../../event/event.service';
import { Game } from '../../game/game.schema';
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

  async createForGame(game: Game): Promise<State> {
    const members = await this.memberService.findAll(game._id, {
      spectator: {$ne: true},
    });
    const state: State = {
      gameId: game._id,
      expectedMoves: [{
        action: 'founding-roll',
        players: members.map(m => m.userId),
      }],
    };
    return this.model.create(state);
  }

  async update(gameId: string, dto: UpdateQuery<State>): Promise<State> {
    const updated = await this.model.findOneAndUpdate({ gameId }, dto, { new: true }).exec();
    updated && this.emit('updated', updated);
    return updated;
  }

  async deleteByGame(gameId: string): Promise<State | undefined> {
    return this.model.findOneAndDelete({ gameId }).exec();
  }

  private emit(event: string, state: State) {
    this.memberService.findAll(state.gameId).then(members => {
      this.eventService.emit(`games.${state.gameId}.state.${event}`, state, members.map(m => m.userId));
    });
  }
}
