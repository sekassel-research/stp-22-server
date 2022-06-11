import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { User } from '../../user/user.schema';
import { MapTemplate } from '../map-template/map-template.schema';
import { VoteService } from './vote.service';

@Injectable()
export class VoteHandler {
  constructor(
    private readonly voteService: VoteService,
  ) {}

  @OnEvent('maps.*.deleted')
  async onMapDeleted(map: MapTemplate) {
    await this.voteService.deleteMany({ mapId: map._id.toString() });
  }

  @OnEvent('users.*.deleted')
  async onUserDeleted(user: User) {
    await this.voteService.deleteMany({ userId: user._id.toString() });
  }
}
