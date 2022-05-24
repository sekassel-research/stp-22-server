import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EventModule } from '../../event/event.module';
import { MemberModule } from '../../member/member.module';
import { MapTemplateModule } from '../map-template/map-template.module';
import { MapController } from './map.controller';
import { MapHandler } from './map.handler';
import { MapService } from './map.service';
import { MapSchema } from './map.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'maps',
        schema: MapSchema,
      },
    ]),
    EventModule,
    MemberModule,
    MapTemplateModule,
  ],
  providers: [MapService, MapHandler],
  controllers: [MapController],
  exports: [
    MapService,
  ],
})
export class MapModule {
}
