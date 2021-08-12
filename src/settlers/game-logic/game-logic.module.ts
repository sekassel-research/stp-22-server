import { Module } from '@nestjs/common';
import { BuildingModule } from '../building/building.module';
import { MapModule } from '../map/map.module';
import { PlayerModule } from '../player/player.module';
import { StateModule } from '../state/state.module';
import { GameLogicHandler } from './game-logic.handler';
import { GameLogicService } from './game-logic.service';

@Module({
  imports: [
    PlayerModule,
    StateModule,
    BuildingModule,
    MapModule,
  ],
  providers: [GameLogicService, GameLogicHandler],
})
export class GameLogicModule {
}
