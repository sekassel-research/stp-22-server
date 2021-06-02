import { BadRequestException, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';

import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { GameService } from '../game/game.service';
import { User } from '../user/user.dto';
import { CreateMemberDto, UpdateMemberDto } from './member.dto';
import { Member } from './member.schema';

@Injectable()
export class MemberService {
  constructor(
    @InjectModel('members') private model: Model<Member>,
    private eventEmitter: EventEmitter2,
    private gameService: GameService,
  ) {
  }

  async checkPassword(gameId: string, member: CreateMemberDto): Promise<boolean | undefined> {
    const game = await this.gameService.findOne(gameId);
    if (!game) {
      return undefined;
    }

    return bcrypt.compare(member.password, game.passwordHash);
  }

  async checkUserModification(gameId: string, actingUser: User, targetUser: string): Promise<'notfound' | 'owner' | 'target' | 'unauthorized'> {
    const game = await this.gameService.findOne(gameId);
    if (!game) {
      return 'notfound';
    }
    if (actingUser.id === game.owner) {
      return 'owner';
    }
    if (actingUser.id === targetUser) {
      return 'target';
    }
    return 'unauthorized';
  }

  async create(gameId: string, userId: string, member: CreateMemberDto): Promise<Member | undefined> {
    const created = await this.model.create({ ...member, password: undefined, userId, gameId });
    if (created) {
      await this.gameService.changeMembers(gameId, +1);
      this.eventEmitter.emit(`games.${gameId}.members.${userId}.created`, created);
    }
    return created;
  }

  async findAll(gameId: string): Promise<Member[]> {
    return this.model.find({ gameId }).exec();
  }

  async findOne(gameId: string, userId: string): Promise<Member | undefined> {
    return this.model.findOne({ gameId, userId }).exec();
  }

  async update(gameId: string, userId: string, member: UpdateMemberDto): Promise<Member | undefined> {
    const updated = await this.model.findOneAndUpdate({ gameId, userId }, member).exec();
    updated && this.eventEmitter.emit(`games.${gameId}.members.${userId}.updated`, updated);
    return updated;
  }

  async deleteAll(gameId: string): Promise<Member[]> {
    const members = await this.findAll(gameId);
    for (const member of members) {
      this.eventEmitter.emit(`games.${gameId}.members.${member.userId}.deleted`, member);
    }
    await this.model.deleteMany({ gameId }).exec();
    return members;
  }

  async delete(gameId: string, userId: string): Promise<Member | undefined> {
    const deleted = await this.model.findOneAndDelete({ gameId, userId }).exec();
    if (deleted) {
      await this.gameService.changeMembers(gameId, -1);
      this.eventEmitter.emit(`games.${gameId}.members.${userId}.deleted`, deleted);
    }
    return deleted;
  }
}
