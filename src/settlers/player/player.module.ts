import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EventModule } from '../../event/event.module';
import { MemberModule } from '../../member/member.module';
import { StateModule } from '../state/state.module';
import { PlayerController } from './player.controller';
import { PlayerHandler } from './player.handler';
import { PlayerSchema } from './player.schema';
import { PlayerService } from './player.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'players',
        schema: PlayerSchema,
      },
    ]),
    MemberModule,
    EventModule,
    StateModule,
  ],
  controllers: [PlayerController],
  providers: [PlayerService, PlayerHandler],
  exports: [PlayerService],
})
export class PlayerModule {
}
