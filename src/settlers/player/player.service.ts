import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MemberService } from '../../member/member.service';
import { Player } from './player.schema';

const COLOR_PALETTE = [
  '#ff0000',
  '#00ff00',
  '#0080ff',
  '#ffffff',
  '#ff8000',
  '#8000ff',
  '#ffff00',
  '#0000ff',
  '#ff00ff',
  '#ff0080',
];

@Injectable()
export class PlayerService {
  constructor(
    @InjectModel('players') private model: Model<Player>,
    private memberService: MemberService,
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

  async createForGame(gameId: string): Promise<Player[]> {
    const members = await this.memberService.findAll(gameId);

    const players: Partial<Player>[] = members.map((m, index) => ({
      gameId,
      userId: m.userId,
      color: COLOR_PALETTE[index % COLOR_PALETTE.length],
      resources: {},
      remainingBuildings: {
        city: 4,
        settlement: 5,
        road: 15,
      },
    }));
    return this.model.insertMany(players);
  }

  async deleteByGame(gameId: string): Promise<void> {
    await this.model.deleteMany({ gameId }).exec();
  }
}
