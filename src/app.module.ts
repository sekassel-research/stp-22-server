import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { AchievementModule } from './achievement/achievement.module';

import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { environment } from './environment';
import { EventModule } from './event/event.module';
import { GameModule } from './game/game.module';
import { GroupModule } from './group/group.module';
import { MemberModule } from './member/member.module';
import { MessageModule } from './message/message.module';
import { SettlersModule } from './settlers/settlers.module';
import { UserModule } from './user/user.module';
import { AchievementSummaryModule } from './achievement-summary/achievement-summary.module';

@Module({
  imports: [
    MongooseModule.forRoot(environment.mongo.uri, {
      useFindAndModify: true,
      useCreateIndex: true,
    }),
    ThrottlerModule.forRoot(environment.rateLimit),
    EventEmitterModule.forRoot({
      wildcard: true,
    }),
    ScheduleModule.forRoot(),
    AuthModule,
    EventModule,
    UserModule,
    AchievementSummaryModule,
    AchievementModule,
    GroupModule,
    MessageModule,
    GameModule,
    MemberModule,
    SettlersModule,
  ],
  providers: [AppService],
})
export class AppModule {
}
