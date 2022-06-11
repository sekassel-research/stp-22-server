import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';

import { EventService } from '../../event/event.service';
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
    return this.model.findOne({  mapId, userId }).exec();
  }

  async findAll(mapId: string, filter: FilterQuery<Vote> = {}): Promise<Vote[]> {
    filter.mapId = mapId;
    return this.model.find(filter).exec();
  }

  async create(mapId: string, userId: string, dto: CreateVoteDto): Promise<Vote> {
    const created = await this.model.create({ ...dto, mapId, userId });
    created && this.emit('created', created);
    return created;
  }

  async update(mapId: string, userId: string, dto: UpdateVoteDto): Promise<Vote | null> {
    const updated = await this.model.findOneAndUpdate({ mapId, userId }, dto, { new: true }).exec();
    updated && this.emit('updated', updated);
    return updated;
  }

  async delete(mapId: string, userId: string): Promise<Vote | null> {
    const deleted = await this.model.findOneAndDelete({ mapId, userId }).exec();
    deleted && this.emit('deleted', deleted);
    return deleted;
  }

  private emit(event: string, vote: Vote): void {
    this.eventEmitter.emit(`maps.${vote.mapId}.votes.${vote.userId}.${event}`, vote);
  }
}
