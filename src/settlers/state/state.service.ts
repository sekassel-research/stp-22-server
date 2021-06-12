import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Game } from '../../game/game.schema';
import { State } from './state.schema';

@Injectable()
export class StateService {
  constructor(
    @InjectModel('states') private model: Model<State>,
  ) {
  }

  async findByGame(gameId: string): Promise<State | undefined> {
    return this.model.findOne({ gameId }).exec();
  }

  async createForGame(game: Game): Promise<State> {
    return this.model.create({
      gameId: game._id,
    });
  }

  async deleteByGame(gameId: string): Promise<State | undefined> {
    return this.model.findOneAndDelete({ gameId }).exec();
  }
}
