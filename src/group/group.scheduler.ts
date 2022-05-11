import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { environment } from '../environment';
import { GroupService } from './group.service';

@Injectable()
export class GroupScheduler {
  private logger = new Logger('Group Cleaner');

  constructor(
    private groupService: GroupService,
  ) {
  }

  @Cron(CronExpression.EVERY_HOUR)
  async deleteStaleGroups() {
    const maxAgeMs = environment.cleanup.deleteEmptyGroupAfterHours * 60 * 60 * 1000;
    const groups = await this.groupService.deleteEmptyGroups(maxAgeMs);
    if (groups.length) {
      this.logger.warn(`Deleted ${groups.length} empty groups.`);
    }
  }
}
