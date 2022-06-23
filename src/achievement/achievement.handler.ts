import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { User } from '../user/user.schema';
import { AchievementService } from './achievement.service';

@Injectable()
export class AchievementHandler {
  constructor(
    private achievementService: AchievementService,
  ) {
  }

  @OnEvent('users.*.deleted')
  async onUserDelete(user: User): Promise<void> {
    await this.achievementService.deleteUser(user._id.toString());
  }
}
