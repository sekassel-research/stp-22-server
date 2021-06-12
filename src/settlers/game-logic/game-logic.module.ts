import { Module } from '@nestjs/common';
import { PlayerModule } from '../player/player.module';
import { StateModule } from '../state/state.module';
import { GameLogicHandler } from './game-logic.handler';
import { GameLogicService } from './game-logic.service';

@Module({
  imports: [
    PlayerModule,
    StateModule,
  ],
  providers: [GameLogicService, GameLogicHandler],
})
export class GameLogicModule {
}
