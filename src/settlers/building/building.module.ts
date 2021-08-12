import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EventModule } from '../../event/event.module';
import { BuildingController } from './building.controller';
import { BuildingHandler } from './building.handler';
import { BuildingSchema } from './building.schema';
import { BuildingService } from './building.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'buildings',
        schema: BuildingSchema,
      },
    ]),
    EventModule,
  ],
  providers: [BuildingService, BuildingHandler],
  controllers: [BuildingController],
  exports: [
    BuildingService,
  ],
})
export class BuildingModule {
}
