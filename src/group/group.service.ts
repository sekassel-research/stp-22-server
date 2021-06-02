import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateGroupDto, UpdateGroupDto } from './group.dto';
import { Group } from './group.schema';

@Injectable()
export class GroupService {
  constructor(
    @InjectModel('groups') private model: Model<Group>,
  ) {
  }

  async find(id: string): Promise<Group | undefined> {
    return this.model.findById(id);
  }

  async findByMember(id: string): Promise<Group[]> {
    return this.model.find({ members: id }).exec();
  }

  async create(dto: CreateGroupDto): Promise<Group> {
    return this.model.create(dto);
  }

  async update(id: string, dto: UpdateGroupDto): Promise<Group | undefined> {
    return this.model.findByIdAndUpdate(id, dto).exec();
  }

  async delete(id: string): Promise<Group | undefined> {
    return this.model.findByIdAndDelete(id).exec();
  }
}
