import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MessageModule } from './message/message.module';
import { UserModule } from './user/user.module';

const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/stpss21';

@Module({
  imports: [
    MongooseModule.forRoot(mongoUri),
    MessageModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
}
