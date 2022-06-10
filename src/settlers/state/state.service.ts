import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, UpdateQuery } from 'mongoose';
import { EventService } from '../../event/event.service';
import { MemberService } from '../../member/member.service';
import { PlayerService } from '../player/player.service';
import { State } from './state.schema';

@Injectable()
export class StateService {
  constructor(
    @InjectModel('states') private model: Model<State>,
    private memberService: MemberService,
    private eventService: EventService,
    private playerService: PlayerService,
  ) {
  }

  async findByGame(gameId: string): Promise<State | null> {
    return this.model.findOne({ gameId }).exec();
  }

  async createForGame(gameId: string): Promise<State | undefined> {
    const members = await this.memberService.findAll(gameId, {
      spectator: {$ne: true},
    });
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
    } catch (err: any) {
      if (err.code === 11000) { // state already exists
        return undefined;
      }
      throw err;
    }
  }

  async update(gameId: string, dto: UpdateQuery<State>): Promise<State | null> {
    const updated = await this.model.findOneAndUpdate({ gameId }, dto, { new: true }).exec();
    updated && this.emit('updated', updated);
    return updated;
  }

  async deleteByGame(gameId: string): Promise<State | null> {
    const deleted = await this.model.findOneAndDelete({ gameId }).exec();
    deleted && this.emit('deleted', deleted);
    return deleted;
  }

  async removePlayer(gameId: string, userId: string) {
    const state = await this.findByGame(gameId);
    if (!state) {
      return;
    }

    // TODO maybe this can be done as a MongoDB update
    let expectedMoves = state.expectedMoves;
    for (const expected of expectedMoves) {
      expected.players = expected.players.filter(p => p !== userId);
    }
    expectedMoves = expectedMoves.filter(m => m.players.length > 0);

    if (expectedMoves.length === 0) {
      const players = await this.playerService.findAll(gameId);
      const userIndex = players.findIndex(p => p.userId === userId);
      const next = players.find((p, i) => i > userIndex && p.active)
        || players.find((p, i) => i < userIndex && p.active);
      if (next) {
        expectedMoves.push({
          action: 'roll',
          players: [next.userId],
        });
      } else {
        // if nobody is active any more, just give up
        // let them end up with an empty state
      }
    }

    await this.update(gameId, { expectedMoves });
  }

  private emit(event: string, state: State) {
    this.memberService.findAll(state.gameId).then(members => {
      this.eventService.emit(`games.${state.gameId}.state.${event}`, state, members.map(m => m.userId));
    });
  }
}
