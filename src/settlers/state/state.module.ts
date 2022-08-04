import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EventModule } from '../../event/event.module';
import { MemberModule } from '../../member/member.module';
import { PlayerModule } from '../player/player.module';
import { StateController } from './state.controller';
import { StateHandler } from './state.handler';
import { StateSchema } from './state.schema';
import { StateService } from './state.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'states',
        schema: StateSchema,
      },
    ]),
    MemberModule,
    EventModule,
    forwardRef(() => PlayerModule),
  ],
  providers: [StateService, StateHandler],
  controllers: [StateController],
  exports: [StateService],
})
export class StateModule {
}
