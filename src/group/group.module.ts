import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { EventModule } from '../event/event.module';
import { MessageModule } from '../message/message.module';
import { GroupController } from './group.controller';
import { GroupScheduler } from './group.scheduler';
import { GroupSchema } from './group.schema';
import { GroupService } from './group.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'groups',
        schema: GroupSchema,
      },
    ]),
    EventModule,
    forwardRef(() => MessageModule),
  ],
  controllers: [GroupController],
  providers: [GroupService, GroupScheduler],
  exports: [GroupService],
})
export class GroupModule {
}
