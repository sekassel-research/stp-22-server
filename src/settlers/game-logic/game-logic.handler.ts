import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Move } from '../move/move.schema';
import { GameLogicService } from './game-logic.service';

@Injectable()
export class GameLogicHandler {
  constructor(
    private gameLogicService: GameLogicService,
  ) {
  }

  @OnEvent('games.*.moves.*.created')
  async onMove(move: Move): Promise<void> {
    return this.gameLogicService.handle(move);
  }
}
