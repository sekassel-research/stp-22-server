import { Module } from '@nestjs/common';
import { MapModule } from './map/map.module';
import { SharedModule } from './shared/shared.module';
import { PlayerModule } from './player/player.module';

@Module({
  imports: [
    MapModule,
    SharedModule,
    PlayerModule,
  ],
})
export class SettlersModule {
}
