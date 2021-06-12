import { Module } from '@nestjs/common';
import { MapModule } from './map/map.module';
import { SharedModule } from './shared/shared.module';
import { PlayerModule } from './player/player.module';
import { StateModule } from './state/state.module';
import { MoveModule } from './move/move.module';

@Module({
  imports: [
    MapModule,
    SharedModule,
    PlayerModule,
    StateModule,
    MoveModule,
  ],
})
export class SettlersModule {
}
