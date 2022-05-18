import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EventModule } from '../../event/event.module';
import { MemberModule } from '../../member/member.module';
import { BuildingModule } from '../building/building.module';
import { MapModule } from '../map/map.module';
import { PlayerModule } from '../player/player.module';
import { StateModule } from '../state/state.module';
import { BuildService } from './game-logic/build.service';
import { GameLogicService } from './game-logic/game-logic.service';
import { RollService } from './game-logic/roll.service';
import { StateTransitionService } from './game-logic/state-transition.service';
import { TradeService } from './game-logic/trade.service';
import { MoveController } from './move.controller';
import { MoveHandler } from './move.handler';
import { MoveSchema } from './move.schema';
import { MoveService } from './move.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'moves',
        schema: MoveSchema,
      },
    ]),
    PlayerModule,
    StateModule,
    BuildingModule,
    MapModule,
    EventModule,
    MemberModule,
  ],
  controllers: [MoveController],
  providers: [
    MoveService,
    MoveHandler,
    GameLogicService,
    StateTransitionService,
    RollService,
    BuildService,
    TradeService,
  ],
})
export class MoveModule {
}
