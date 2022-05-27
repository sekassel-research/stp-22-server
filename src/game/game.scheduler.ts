import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { environment } from '../environment';
import { GameService } from './game.service';

@Injectable()
export class GameScheduler {
  private logger = new Logger('Game Cleaner');

  constructor(
    private gameService: GameService,
  ) {
  }

  @Cron(CronExpression.EVERY_HOUR)
  async deleteEmptyGames(): Promise<void> {
    const maxAgeMs = environment.cleanup.gameLifetimeHours * 60 * 60 * 1000;
    const games = await this.gameService.deleteMany({
      updatedAt: { $lt: new Date(Date.now() - maxAgeMs) },
    });
    if (games.length) {
      this.logger.warn(`Deleted ${games.length} old games.`);
    }
  }
}
