import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Game } from '../game/game.schema';
import { SettlersService } from './settlers.service';

@Injectable()
export class SettlersHandler {
  constructor(
    private settlersService: SettlersService,
  ){}

  @OnEvent('games.*.updated')
  async onGameUpdated(game: Game): Promise<void> {
    if (game.started) {
      await this.settlersService.createGameMap(game);
    } else {
      await this.settlersService.deleteGameMap(game._id);
    }
  }
}
