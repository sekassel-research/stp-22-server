import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { EventModule } from '../event/event.module';
import { GameModule } from '../game/game.module';
import { MemberController } from './member.controller';
import { MemberHandler } from './member.handler';
import { MemberSchema } from './member.schema';
import { MemberService } from './member.service';

@Module({
  imports: [
    MongooseModule.forFeature([{
      name: 'members',
      schema: MemberSchema,
    }]),
    GameModule,
    EventModule,
  ],
  controllers: [MemberController],
  providers: [MemberService, MemberHandler],
  exports: [MemberService],
})
export class MemberModule {
}
