import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { environment } from '../environment';
import { GameService } from './game.service';

@Injectable()
export class GameScheduler {
  constructor(
    private gameService: GameService,
  ) {
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  async deleteEmptyGames(): Promise<void> {
    const maxAgeMs = environment.cleanup.deleteGameAfterHours * 60 * 60 * 1000;
    await this.gameService.deleteOldGames(maxAgeMs);
  }
}
