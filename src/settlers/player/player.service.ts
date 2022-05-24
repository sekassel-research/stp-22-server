import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, UpdateQuery } from 'mongoose';
import { EventService } from '../../event/event.service';
import { MemberService } from '../../member/member.service';
import { INITIAL_BUILDINGS } from '../shared/constants';
import { Player, PlayerDocument } from './player.schema';

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

  async findAll(gameId: string, sort?: any): Promise<PlayerDocument[]> {
    let query = this.model.find({ gameId });
    if (sort) {
      query = query.sort(sort);
    }
    return query.exec();
  }

  async findOne(gameId: string, userId: string): Promise<PlayerDocument | undefined> {
    return this.model.findOne({ gameId, userId }).exec();
  }

  mask(player: PlayerDocument): Player {
    const { _id, resources, victoryPoints, ...rest } = player.toObject();
    const unknown = Object.values(resources).sum();
    return {
      ...rest,
      resources: { unknown },
    };
  }

  async createForGame(gameId: string): Promise<PlayerDocument[]> {
    const members = await this.memberService.findAll(gameId, {
      spectator: { $ne: true },
    });

    const players: Player[] = members.map((m, index) => ({
      gameId,
      userId: m.userId,
      color: m.color ?? COLOR_PALETTE[index % COLOR_PALETTE.length],
      resources: {},
      remainingBuildings: INITIAL_BUILDINGS,
      victoryPoints: 0,
    }));
    const playerDocs = await this.model.insertMany(players);
    this.emit('created', ...playerDocs);
    return playerDocs;
  }

  async update(gameId: string, userId: string, dto: UpdateQuery<Player>, filter?: FilterQuery<Player>): Promise<PlayerDocument | undefined> {
    const updated = await this.model.findOneAndUpdate({ ...filter, gameId, userId }, dto, { new: true }).exec();
    updated && this.emit('updated', updated);
    return updated;
  }

  async deleteByGame(gameId: string): Promise<void> {
    const players = await this.findAll(gameId);
    await this.model.deleteMany({ gameId }).exec();
    this.emit('deleted', ...players);
  }

  private emit(action: string, ...players: PlayerDocument[]) {
    const maskedPlayers = players.map(p => this.maskResources(p));
    this.memberService.findAll(players[0].gameId).then(members => {
      const users = members.map(m => m.userId);
      for (let i = 0; i < players.length; i++){
        const player = players[i];
        const event = `games.${player.gameId}.players.${player.userId}.${action}`;
        this.eventEmitter.emit(event, player, [player.userId]);

        const maskedPlayer = maskedPlayers[i];
        const otherUserIds = users.filter(u => u !== player.userId);
        this.eventEmitter.emit(event, maskedPlayer, otherUserIds);
      }
    });
  }
}
