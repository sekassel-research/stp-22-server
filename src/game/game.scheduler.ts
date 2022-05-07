import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { GameService } from './game.service';

@Injectable()
export class GameScheduler {
  constructor(
    private gameService: GameService,
  ) {
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  async deleteEmptyGames(): Promise<void> {
    const oneHourMs = 60 * 60 * 1000;
    await this.gameService.deleteOldGames(oneHourMs);
  }
}
