import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
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
  ],
  providers: [MapService, MapHandler],
  controllers: [MapController],
  exports: [
    MapService,
  ],
})
export class MapModule {
}
