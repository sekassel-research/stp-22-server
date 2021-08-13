import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Document, FilterQuery, Model } from 'mongoose';
import { EventService } from '../../event/event.service';
import { Building } from './building.schema';

@Injectable()
export class BuildingService {
  constructor(
    @InjectModel('buildings') private model: Model<Building>,
    private eventEmitter: EventService,
  ) {
  }

  async findAll(filter?: FilterQuery<Building>): Promise<Building[]> {
    return this.model.find(filter).exec();
  }

  async create(building: Building): Promise<Building & Document> {
    const created = await this.model.create(building);
    created && this.emit('created', created);
    return created;
  }

  async deleteByGame(gameId: string): Promise<void> {
    await this.model.deleteMany({ gameId }).exec();
  }

  private emit(event: string, building: Building & Document) {
    this.eventEmitter.emit(`games.${building.gameId}.buildings.${building._id}.${event}`, building); // TODO visibility
  }
}
