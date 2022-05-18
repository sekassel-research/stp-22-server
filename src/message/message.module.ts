import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { environment } from '../environment';

import { EventModule } from '../event/event.module';
import { MemberResolverModule } from '../member-resolver/member-resolver.module';
import { MessageController } from './message.controller';
import { MessageHandler } from './message.handler';
import { MessageScheduler } from './message.scheduler';
import { MessageSchema } from './message.schema';
import { MessageService } from './message.service';

@Module({
  imports: [
    MongooseModule.forFeature([{
      name: 'messages',
      schema: MessageSchema,
    }]),
    MemberResolverModule,
    EventModule,
  ],
  providers: [
    MessageService,
    MessageHandler,
    ...(environment.passive ? [] : [MessageScheduler]),
  ],
  controllers: [MessageController],
})
export class MessageModule {
}
