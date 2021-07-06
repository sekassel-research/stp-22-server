import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';

import { EventService } from '../event/event.service';
import { GameService } from '../game/game.service';
import { User } from '../user/user.schema';
import { CreateMemberDto, UpdateMemberDto } from './member.dto';
import { Member } from './member.schema';

@Injectable()
export class MemberService {
  constructor(
    @InjectModel('members') private model: Model<Member>,
    private eventEmitter: EventService,
    private gameService: GameService,
  ) {
  }

  async checkPassword(gameId: string, member: CreateMemberDto): Promise<'ok' | 'incorrect' | 'notfound' | 'started'> {
    const game = await this.gameService.findOne(gameId);
    if (!game) {
      return 'notfound';
    }
    if (game.started) {
      return 'started';
    }

    return bcrypt.compare(member.password, game.passwordHash) ? 'ok' : 'incorrect';
  }

  async checkUserModification(gameId: string, actingUser: User, targetUser: string): Promise<'notfound' | 'started' | 'owner' | 'owner-target' | 'target' | 'unauthorized'> {
    const game = await this.gameService.findOne(gameId);
    if (!game) {
      return 'notfound';
    }
    if (game.started) {
      return 'started';
    }
    if (actingUser._id === targetUser) {
      if (actingUser._id === game.owner) {
        return 'owner-target';
      }
      return 'target';
    }
    if (actingUser._id === game.owner) {
      return 'owner';
    }
    return 'unauthorized';
  }

  async create(gameId: string, userId: string, member: CreateMemberDto): Promise<Member | undefined> {
    const created = await this.model.create({ ...member, password: undefined, userId, gameId });
    if (created) {
      await this.gameService.changeMembers(gameId, +1);
      this.emit('created', created);
    }
    return created;
  }

  async findAll(gameId: string): Promise<Member[]> {
    return this.model.find({ gameId }).exec();
  }

  async findOne(gameId: string, userId: string): Promise<Member | undefined> {
    return this.model.findOne({ gameId, userId }).exec();
  }

  async update(gameId: string, userId: string, dto: UpdateMemberDto): Promise<Member | undefined> {
    const updated = await this.model.findOneAndUpdate({ gameId, userId }, dto, { new: true }).exec();
    updated && this.emit('updated', updated);
    return updated;
  }

  async deleteGame(gameId: string): Promise<Member[]> {
    const members = await this.findAll(gameId);
    for (const member of members) {
      this.emit('deleted', member);
    }
    await this.model.deleteMany({ gameId }).exec();
    return members;
  }

  async deleteUser(userId: string): Promise<Member[]> {
    const members = await this.model.find({ userId }).exec();
    for (const member of members) {
      this.emit('deleted', member);
    }
    await this.model.deleteMany({ userId }).exec();
    return members;
  }

  async delete(gameId: string, userId: string): Promise<Member | undefined> {
    const deleted = await this.model.findOneAndDelete({ gameId, userId }).exec();
    if (deleted) {
      await this.gameService.changeMembers(gameId, -1);
      this.emit('deleted', deleted);
    }
    return deleted;
  }

  private emit(event: string, member: Member): void {
    this.eventEmitter.emit(`games.${member.gameId}.members.${member.userId}.${event}`, member);
  }
}
