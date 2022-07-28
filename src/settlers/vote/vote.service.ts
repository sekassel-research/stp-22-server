import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';

import { EventService } from '../../event/event.service';
import { MapTemplate } from '../map-template/map-template.schema';
import { CreateVoteDto, UpdateVoteDto } from './vote.dto';
import { Vote } from './vote.schema';

@Injectable()
export class VoteService {
  constructor(
    @InjectModel('votes') private model: Model<Vote>,
    private eventEmitter: EventService,
  ) {
  }

  async find(mapId: string, userId: string): Promise<Vote | null> {
    return this.model.findOne({ mapId, userId }).exec();
  }

  async findAll(filter: FilterQuery<Vote> = {}): Promise<Vote[]> {
    return this.model.find(filter).exec();
  }

  async create(mapId: string, userId: string, dto: CreateVoteDto): Promise<Vote> {
    const created = await this.model.create({ ...dto, mapId, userId });
    created && this.emit('created', created);
    return created;
  }

  async update(mapId: string, userId: string, dto: UpdateVoteDto): Promise<Vote | null> {
    const original = await this.find(mapId, userId);
    const updated = await this.model.findOneAndUpdate({ mapId, userId }, dto, { new: true }).exec();
    original && updated && this.emit('updated', updated, original);
    return updated;
  }

  async delete(mapId: string, userId: string): Promise<Vote | null> {
    const deleted = await this.model.findOneAndDelete({ mapId, userId }).exec();
    deleted && this.emit('deleted', deleted);
    return deleted;
  }

  async deleteMany(filter: FilterQuery<MapTemplate>): Promise<Vote[]> {
    const votes = await this.findAll(filter);
    await this.model.deleteMany(filter).exec();
    for (const vote of votes) {
      this.emit('deleted', vote);
    }
    return votes;
  }

  private emit(event: string, vote: Vote, oldVote?: Vote): void {
    this.eventEmitter.emit(`maps.${vote.mapId}.votes.${vote.userId}.${event}`, vote, undefined, oldVote);
  }
}
