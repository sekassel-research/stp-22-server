import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Map } from './settlers.schema';

@Injectable()
export class SettlersService {
  constructor(
    @InjectModel('maps') private model: Model<Map>,
  ) {
  }

  async find(gameId: string): Promise<Map | undefined> {
    return this.model.findOne({ gameId }).exec();
  }
}
