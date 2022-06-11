import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { MapTemplate } from '../map-template/map-template.schema';
import { VoteService } from './vote.service';

@Injectable()
export class VoteHandler {
  constructor(
    private readonly voteService: VoteService,
  ) {}

  @OnEvent('maps.*.deleted')
  async onMapDeleted(map: MapTemplate) {
    await this.voteService.deleteMany(map._id.toString());
  }
}
