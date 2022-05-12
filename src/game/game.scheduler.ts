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

  @Cron(CronExpression.EVERY_10_MINUTES)
  async deleteEmptyGames(): Promise<void> {
    const maxAgeMs = environment.cleanup.deleteGameAfterHours * 60 * 60 * 1000;
    const games = await this.gameService.deleteOldGames(maxAgeMs);
    if (games.length) {
      this.logger.warn(`Deleted ${games.length} old games.`);
    }
  }
}
