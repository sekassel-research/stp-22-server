import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EventModule } from '../../event/event.module';

import { MapTemplateController } from './map-template.controller';
import { MapTemplateSchema } from './map-template.schema';
import { MapTemplateService } from './map-template.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'map-templates',
        schema: MapTemplateSchema,
      },
    ]),
    EventModule,
  ],
  controllers: [MapTemplateController],
  providers: [MapTemplateService],
  exports: [MapTemplateService],
})
export class MapTemplateModule {
}
