import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MemberModule } from '../../member/member.module';
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
  ],
  controllers: [PlayerController],
  providers: [PlayerService, PlayerHandler],
  exports: [PlayerService],
})
export class PlayerModule {
}