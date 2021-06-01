import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GameModule } from '../game/game.module';
import { MemberController } from './member.controller';
import { MemberSchema } from './member.schema';
import { MemberService } from './member.service';

@Module({
  imports: [
    MongooseModule.forFeature([{
      name: 'members',
      schema: MemberSchema,
    }]),
    GameModule,
  ],
  controllers: [MemberController],
  providers: [MemberService],
})
export class MemberModule {
}