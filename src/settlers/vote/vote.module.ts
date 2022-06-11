import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EventModule } from '../../event/event.module';
import { MapModule } from '../map/map.module';

import { VoteController } from './vote.controller';
import { VoteSchema } from './vote.schema';
import { VoteService } from './vote.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'votes',
        schema: VoteSchema,
      },
    ]),
    MapModule,
    EventModule,
  ],
  controllers: [VoteController],
  providers: [VoteService],
  exports: [VoteService],
})
export class VoteModule {
}
