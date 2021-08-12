import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, UpdateQuery } from 'mongoose';
import { EventService } from '../../event/event.service';
import { Member } from '../../member/member.schema';
import { MemberService } from '../../member/member.service';
import { INITIAL_BUILDINGS } from '../shared/constants';
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
    private eventEmitter: EventService,
  ) {
  }

  async findAll(gameId: string): Promise<Player[]> {
    return this.model.find({ gameId }).sort({foundingRoll: -1}).exec();
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
      remainingBuildings: INITIAL_BUILDINGS,
    }));
    return this.model.insertMany(players);
  }

  async update(gameId: string, userId: string, dto: UpdateQuery<Player>): Promise<Player | undefined> {
    const updated = await this.model.findOneAndUpdate({ gameId, userId }, dto, { new: true }).exec();
    updated && this.emit('updated', updated, await this.memberService.findAll(gameId));
    return updated;
  }

  async deleteByGame(gameId: string): Promise<void> {
    await this.model.deleteMany({ gameId }).exec();
  }

  private emit(action: string, player: Player, members: Member[]) {
    const event = `games.${player.gameId}.players.${player.userId}.${action}`;
    this.eventEmitter.emit(event, player, [player.userId]);

    const maskedPlayer = this.maskResources(player);
    const otherMemberIds = members.map(m => m.userId).filter(u => u !== player.userId);
    this.eventEmitter.emit(event, maskedPlayer, otherMemberIds);
  }
}
