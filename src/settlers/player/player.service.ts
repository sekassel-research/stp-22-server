import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Player } from './player.schema';

@Injectable()
export class PlayerService {
  constructor(
    @InjectModel('players') private model: Model<Player>,
  ) {
  }

  async findAll(gameId: string): Promise<Player[]> {
    return this.model.find({ gameId }).exec();
  }

  async findOne(gameId: string, userId: string): Promise<Player | undefined> {
    return this.model.findOne({ gameId, userId }).exec();
  }

  maskResources(player: Player): Player {
    const total = Object.values(player.resources).reduce((a, c) => a + c, 0);
    return {
      ...player,
      resources: {
        unknown: total,
      },
    };
  }
}
