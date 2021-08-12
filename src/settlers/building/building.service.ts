import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { Building } from './building.schema';

@Injectable()
export class BuildingService {
  constructor(
    @InjectModel('buildings') private model: Model<Building>,
  ) {
  }

  async findAll(filter?: FilterQuery<Building>): Promise<Building[]> {
    return this.model.find(filter).exec();
  }

  async create(building: Building): Promise<Building> {
    return this.model.create(building);
  }

  async deleteByGame(gameId: string): Promise<void> {
    await this.model.deleteMany({ gameId }).exec();
  }
}
