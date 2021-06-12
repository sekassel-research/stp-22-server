import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Game } from '../../game/game.schema';
import { PlayerService } from './player.service';

@Injectable()
export class PlayerHandler {
  constructor(
    private playerService: PlayerService,
  ) {
  }

  @OnEvent('games.*.updated')
  async onGameUpdated(game: Game): Promise<void> {
    if (game.started) {
      await this.playerService.createForGame(game._id);
    } else {
      await this.playerService.deleteByGame(game._id);
    }
  }

  @OnEvent('games.*.deleted')
  async onGameDeleted(game: Game): Promise<void> {
    await this.playerService.deleteByGame(game._id);
  }
}
