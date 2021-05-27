import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MessageController } from './message.controller';
import { MessageSchema } from './message.schema';
import { MessageService } from './message.service';

@Module({
  imports: [
    MongooseModule.forFeature([{
      name: 'messages',
      schema: MessageSchema,
    }]),
  ],
  providers: [MessageService],
  controllers: [MessageController],
})
export class MessageModule {
}
