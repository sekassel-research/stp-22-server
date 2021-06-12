import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Game } from '../../game/game.schema';
import { MemberService } from '../../member/member.service';
import { State } from './state.schema';

@Injectable()
export class StateService {
  constructor(
    @InjectModel('states') private model: Model<State>,
    private memberService: MemberService,
    private eventEmitter: EventEmitter2,
  ) {
  }

  async findByGame(gameId: string): Promise<State | undefined> {
    return this.model.findOne({ gameId }).exec();
  }

  async createForGame(game: Game): Promise<State> {
    const members = await this.memberService.findAll(game._id);
    const [first, ...rest] = members;
    return this.model.create({
      gameId: game._id,
      activePlayer: first.userId,
      nextPlayers: rest.map(m => m.userId),
      activeTask: 'founding-roll',
      round: 0,
    });
  }

  async update(gameId: string, dto: Partial<State>): Promise<State> {
    const updated = await this.model.findOneAndUpdate({ gameId }, dto, { new: true }).exec();
    updated && this.emit('updated', updated);
    return updated;
  }

  async deleteByGame(gameId: string): Promise<State | undefined> {
    return this.model.findOneAndDelete({ gameId }).exec();
  }

  private emit(event: string, updated: State) {
    this.eventEmitter.emit(`games.${updated.gameId}.state.${event}`, updated); // TODO visibility
  }
}
