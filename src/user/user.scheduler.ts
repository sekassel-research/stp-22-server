import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { environment } from '../environment';
import { UserService } from './user.service';

@Injectable()
export class UserScheduler {
  private logger = new Logger('User Cleaner');

  constructor(
    private userService: UserService,
  ) {
  }

  @Cron(CronExpression.EVERY_HOUR)
  async deleteTempUsers() {
    const maxAgeMs = environment.cleanup.deleteTempUserAfterHours * 60 * 60 * 1000;
    const users = await this.userService.deleteTempUsers(maxAgeMs);
    if (users.length) {
      this.logger.warn(`Deleted ${users.length} temporary users.`);
    }
  }
}
