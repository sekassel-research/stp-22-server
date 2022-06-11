import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { environment } from '../environment';
import { Namespace } from '../member-resolver/member-resolver.service';
import { MessageService } from './message.service';

@Injectable()
export class MessageScheduler {
  private logger = new Logger('Message Cleaner');

  constructor(
    private messageService: MessageService,
  ) {
  }

  @Cron(CronExpression.EVERY_HOUR)
  async deleteGlobalMessages(): Promise<void> {
    const maxGlobalAgeMs = environment.cleanup.globalMessageLifetimeHours * 60 * 60 * 1000;
    const messages = await this.messageService.deleteAll(Namespace.global, undefined, 'global', {
      createdAt: { $lt: new Date(Date.now() - maxGlobalAgeMs) },
    });
    if (messages.length) {
      this.logger.warn(`Deleted ${messages.length} global messages.`);
    }
  }

  @Cron(CronExpression.EVERY_HOUR)
  async deleteSpamMessages(): Promise<void> {
    const maxSpamAgeMs = environment.cleanup.spamMessageLifetimeHours * 60 * 60 * 1000;
    const messages = await this.messageService.deleteAll(undefined, undefined, undefined, {
      createdAt: { $lt: new Date(Date.now() - maxSpamAgeMs) },
      body: environment.cleanup.spamMessagePattern,
    });
    if (messages.length) {
      this.logger.warn(`Deleted ${messages.length} spam messages.`);
    }
  }

  @Cron(CronExpression.EVERY_HOUR)
  async deleteOrphanMessages(): Promise<void> {
    const maxAgeMs = environment.cleanup.orphanMessageLifetimeHours * 60 * 60 * 1000;
    const messages = await this.messageService.deleteOrphaned({
      createdAt: { $lt: new Date(Date.now() - maxAgeMs) },
    });
    if (messages.length) {
      this.logger.warn(`Deleted ${messages.length} orphan messages.`);
    }
  }
}
