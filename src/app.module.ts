import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { environment } from './environment';
import { MemberModule } from './member/member.module';
import { MessageModule } from './message/message.module';
import { UserModule } from './user/user.module';
import { GameModule } from './game/game.module';
import { AppGateway } from './app.gateway';
import { GroupModule } from './group/group.module';
import { SettlersModule } from './settlers/settlers.module';

const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/stpss21';

@Module({
  imports: [
    MongooseModule.forRoot(mongoUri, {
      useFindAndModify: true,
      useCreateIndex: true,
    }),
    ThrottlerModule.forRoot(environment.rateLimit),
    EventEmitterModule.forRoot({
      wildcard: true,
    }),
    ScheduleModule.forRoot(),
    AuthModule,
    UserModule,
    GroupModule,
    MessageModule,
    GameModule,
    MemberModule,
    SettlersModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    AppGateway,
  ],
})
export class AppModule {
}
