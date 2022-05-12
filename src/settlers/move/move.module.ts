import { Module } from '@nestjs/common';
import { EventModule } from '../../event/event.module';
import { MemberModule } from '../../member/member.module';
import { BuildingModule } from '../building/building.module';
import { MapModule } from '../map/map.module';
import { PlayerModule } from '../player/player.module';
import { StateModule } from '../state/state.module';
import { GameLogicService } from './game-logic/game-logic.service';
import { MoveController } from './move.controller';
import { MoveService } from './move.service';
import { StateTransitionService } from './game-logic/state-transition.service';
import { RollService } from './game-logic/roll.service';
import { BuildService } from './game-logic/build.service';

@Module({
  imports: [
    PlayerModule,
    StateModule,
    BuildingModule,
    MapModule,
    EventModule,
    MemberModule,
  ],
  controllers: [MoveController],
  providers: [MoveService, GameLogicService, StateTransitionService, RollService, BuildService],
})
export class MoveModule {
}
