import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Game } from '../../game/game.schema';
import { MoveService } from './move.service';

@Injectable()
export class MoveHandler {
  constructor(
    private moveService: MoveService,
  ) {
  }

  @OnEvent('games.*.deleted')
  async onGameDeleted(game: Game): Promise<void> {
    await this.moveService.deleteAll(game._id);
  }
}
