import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateGroupDto, UpdateGroupDto } from './group.dto';
import { Group } from './group.schema';

@Injectable()
export class GroupService {
  constructor(
    @InjectModel('groups') private model: Model<Group>,
    private eventEmitter: EventEmitter2,
  ) {
  }

  async find(id: string): Promise<Group | undefined> {
    return this.model.findById(id);
  }

  async findByMember(id: string): Promise<Group[]> {
    return this.model.find({ members: id }).exec();
  }

  async findByMembers(members: string[]): Promise<Group[]> {
    members = this.normalizeMembers(members);
    return this.model.find({ members }).exec();
  }

  async create(dto: CreateGroupDto): Promise<Group> {
    dto.members = this.normalizeMembers(dto.members);
    const created = await this.model.create(dto);
    created && this.eventEmitter.emit('group.created', created, created.members);
    return created;
  }

  async update(id: string, dto: UpdateGroupDto): Promise<Group | undefined> {
    dto.members = this.normalizeMembers(dto.members);
    const updated = await this.model.findByIdAndUpdate(id, dto).exec();
    // FIXME when someone is removed from the group, he does not receive the event
    updated && this.eventEmitter.emit('group.updated', updated, updated.members);
    return updated;
  }

  private normalizeMembers(members: string[]): string[] {
    return [...new Set(members)];
  }

  async delete(id: string): Promise<Group | undefined> {
    const deleted = await this.model.findByIdAndDelete(id).exec();
    deleted && this.eventEmitter.emit('group.deleted', deleted, deleted.members);
    return deleted;
  }
}
