import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../user/user.dto';
import { CreateMemberDto, UpdateMemberDto } from './member.dto';
import { Member } from './member.schema';

@Injectable()
export class MemberService {
  constructor(
    @InjectModel('members') private model: Model<Member>,
  ) {
  }

  async create(gameId: string, user: User, member: CreateMemberDto): Promise<Member> {
    return this.model.create({ ...member, userId: user.id, gameId });
  }

  async findAll(gameId: string): Promise<Member[]> {
    return this.model.find({ gameId }).exec();
  }

  async findOne(gameId: string, userId: string): Promise<Member | undefined> {
    return this.model.findOne({ gameId, userId }).exec();
  }

  async update(gameId: string, userId: string, member: UpdateMemberDto): Promise<Member | undefined> {
    return this.model.findOneAndUpdate({ gameId, userId }, member).exec();
  }

  async delete(gameId: string, userId: string): Promise<Member | undefined> {
    return this.model.findOneAndDelete({ gameId, userId }).exec();
  }
}
