import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { EventService } from '../../event/event.service';
import { CreateBuildingDto, UpdateBuildingDto } from './building.dto';
import { Building, BuildingDocument } from './building.schema';

@Injectable()
export class BuildingService {
  constructor(
    @InjectModel('buildings') private model: Model<Building>,
    private eventEmitter: EventService,
  ) {
  }

  async findAll(filter?: FilterQuery<Building>): Promise<BuildingDocument[]> {
    return this.model.find(filter).exec();
  }

  async create(gameId: string, owner: string, building: CreateBuildingDto): Promise<BuildingDocument> {
    const created = await this.model.create({
      ...building,
      gameId,
      owner,
    });
    created && this.emit('created', created);
    return created;
  }

  async update(id: string, building: UpdateBuildingDto): Promise<BuildingDocument | undefined> {
    const updated = await this.model.findByIdAndUpdate(id, building, { new: true });
    updated && this.emit('updated', updated);
    return updated;
  }

  async deleteByGame(gameId: string): Promise<void> {
    await this.model.deleteMany({ gameId }).exec();
  }

  private emit(event: string, building: BuildingDocument) {
    this.eventEmitter.emit(`games.${building.gameId}.buildings.${building._id}.${event}`, building); // TODO visibility
  }
}
