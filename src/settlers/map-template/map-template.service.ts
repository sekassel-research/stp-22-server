import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';

import { EventService } from '../../event/event.service';
import { CreateMapTemplateDto, UpdateMapTemplateDto } from './map-template.dto';
import { MapTemplate } from './map-template.schema';

@Injectable()
export class MapTemplateService {
  constructor(
    @InjectModel('map-templates') private model: Model<MapTemplate>,
    private eventEmitter: EventService,
  ) {
  }

  async find(id: string): Promise<MapTemplate | undefined> {
    return this.model.findById(id);
  }

  async findAll(filter?: FilterQuery<MapTemplate>): Promise<MapTemplate[]> {
    return this.model.find(filter).exec();
  }

  async create(createdBy: string, dto: CreateMapTemplateDto): Promise<MapTemplate> {
    const created = await this.model.create({ ...dto, createdBy });
    created && this.emit('created', created);
    return created;
  }

  async update(id: string, dto: UpdateMapTemplateDto): Promise<MapTemplate | undefined> {
    const updated = await this.model.findByIdAndUpdate(id, dto, { new: true }).exec();
    updated && this.emit('updated', updated);
    return updated;
  }

  async delete(id: string): Promise<MapTemplate | undefined> {
    const deleted = await this.model.findByIdAndDelete(id).exec();
    deleted && this.emit('deleted', deleted);
    return deleted;
  }

  private emit(event: string, template: MapTemplate): void {
    this.eventEmitter.emit(`maps.${template._id}.${event}`, template);
  }
}
