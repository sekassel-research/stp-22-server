import { Module } from '@nestjs/common';
import { BuildingModule } from './building/building.module';
import { MapTemplateModule } from './map-template/map-template.module';
import { MapModule } from './map/map.module';
import { MoveModule } from './move/move.module';
import { PlayerModule } from './player/player.module';
import { SharedModule } from './shared/shared.module';
import { StateModule } from './state/state.module';
import { VoteModule } from './vote/vote.module';

@Module({
  imports: [
    MapTemplateModule,
    VoteModule,
    MapModule,
    SharedModule,
    PlayerModule,
    StateModule,
    BuildingModule,
    MoveModule,
  ],
})
export class SettlersModule {
}
