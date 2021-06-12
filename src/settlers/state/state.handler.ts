import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Game } from '../../game/game.schema';
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
      await this.stateService.createForGame(game);
    } else {
      await this.stateService.deleteByGame(game._id);
    }
  }

  @OnEvent('games.*.deleted')
  async onGameDeleted(game: Game): Promise<void> {
    await this.stateService.deleteByGame(game._id);
  }
}
