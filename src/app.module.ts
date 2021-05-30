import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { environment } from './environment';
import { MessageModule } from './message/message.module';
import { UserModule } from './user/user.module';

const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/stpss21';

@Module({
  imports: [
    MongooseModule.forRoot(mongoUri),
    ThrottlerModule.forRoot(environment.rateLimit),
    MessageModule,
    AuthModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
  ],
})
export class AppModule {
}
