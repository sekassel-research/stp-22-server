import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { EventService } from '../../event/event.service';
import { MemberService } from '../../member/member.service';
import { CreateBuildingDto, UpdateBuildingDto } from './building.dto';
import { Building, BuildingDocument } from './building.schema';

@Injectable()
export class BuildingService {
  constructor(
    @InjectModel('buildings') private model: Model<Building>,
    private eventEmitter: EventService,
    private memberService: MemberService,
  ) {
  }

  async findAll(filter: FilterQuery<Building> = {}): Promise<BuildingDocument[]> {
    return this.model.find(filter).exec();
  }

  async findOne(id: string): Promise<BuildingDocument | null> {
    return this.model.findById(id).exec();
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

  async update(id: string, building: UpdateBuildingDto): Promise<BuildingDocument | null> {
    const updated = await this.model.findByIdAndUpdate(id, building, { new: true });
    updated && this.emit('updated', updated);
    return updated;
  }

  async deleteByGame(gameId: string): Promise<void> {
    const buildings = await this.findAll({ gameId });
    await this.model.deleteMany({ gameId }).exec();
    this.emit('deleted', ...buildings);
  }

  private emit(event: string, ...buildings: BuildingDocument[]) {
    if (!buildings.length) {
      return;
    }
    this.memberService.findAll(buildings[0].gameId).then(members => {
      const users = members.map(m => m.userId);
      for (const building of buildings) {
        this.eventEmitter.emit(`games.${building.gameId}.buildings.${building._id}.${event}`, building, users);
      }
    });
  }
}
