import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Game } from '../../game/game.schema';
import { MapService } from './map.service';

@Injectable()
export class MapHandler {
  constructor(
    private settlersService: MapService,
  ){}

  @OnEvent('games.*.updated')
  async onGameUpdated(game: Game): Promise<void> {
    if (game.started) {
      await this.settlersService.createForGame(game);
    } else {
      await this.settlersService.deleteByGame(game._id);
    }
  }
}
