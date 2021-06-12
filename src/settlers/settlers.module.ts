import { Module } from '@nestjs/common';
import { GameLogicModule } from './game-logic/game-logic.module';
import { MapModule } from './map/map.module';
import { MoveModule } from './move/move.module';
import { PlayerModule } from './player/player.module';
import { SharedModule } from './shared/shared.module';
import { StateModule } from './state/state.module';

@Module({
  imports: [
    MapModule,
    SharedModule,
    PlayerModule,
    StateModule,
    MoveModule,
    GameLogicModule,
  ],
})
export class SettlersModule {
}
