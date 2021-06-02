import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MemberResolverModule } from '../member-resolver/member-resolver.module';
import { MessageController } from './message.controller';
import { MessageHandler } from './message.handler';
import { MessageSchema } from './message.schema';
import { MessageService } from './message.service';

@Module({
  imports: [
    MongooseModule.forFeature([{
      name: 'messages',
      schema: MessageSchema,
    }]),
    MemberResolverModule,
  ],
  providers: [MessageService, MessageHandler],
  controllers: [MessageController],
})
export class MessageModule {
}
