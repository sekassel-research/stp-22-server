import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
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
}
