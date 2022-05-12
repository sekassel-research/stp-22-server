import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { environment } from '../environment';

import { EventModule } from '../event/event.module';
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
  ],
  controllers: [GroupController],
  providers: environment.passive ? [GroupService] : [GroupService, GroupScheduler],
  exports: [GroupService],
})
export class GroupModule {
}
