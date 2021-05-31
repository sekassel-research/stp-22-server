import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../user/user.dto';
import { CreateMemberDto, UpdateMemberDto } from './member.dto';
import { Member } from './member.schema';

@Injectable()
export class MemberService {
  constructor(
    @InjectModel('members') private model: Model<Member>,
    private eventEmitter: EventEmitter2,
  ) {
  }

  async create(gameId: string, user: User, member: CreateMemberDto): Promise<Member> {
    const created = await this.model.create({ ...member, userId: user.id, gameId });
    created && this.eventEmitter.emit('member.created', created);
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
    updated && this.eventEmitter.emit('member.updated', updated);
    return updated;
  }

  async delete(gameId: string, userId: string): Promise<Member | undefined> {
    const deleted = await this.model.findOneAndDelete({ gameId, userId }).exec();
    deleted && this.eventEmitter.emit('member.deleted', deleted);
    return deleted;
  }
}
