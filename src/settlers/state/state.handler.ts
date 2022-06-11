import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Game } from '../../game/game.schema';
import { Player } from '../player/player.schema';
import { StateService } from './state.service';

@Injectable()
export class StateHandler {
  constructor(
    private stateService: StateService,
  ) {
  }

  @OnEvent('games.*.updated')
  async onGameUpdated(game: Game): Promise<void> {
    if (game.started) {
      await this.stateService.createForGame(game._id.toString());
    }
  }

  @OnEvent('games.*.deleted')
  async onGameDeleted(game: Game): Promise<void> {
    await this.stateService.deleteByGame(game._id.toString());
  }

  @OnEvent('games.*.players.*.updated')
  async onPlayerUpdated(player: Player): Promise<void> {
    if (!player.active) {
      await this.stateService.removePlayer(player.gameId, player.userId);
    }
  }
}
