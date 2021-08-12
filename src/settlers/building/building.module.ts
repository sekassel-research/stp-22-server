import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
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
  ],
  providers: [BuildingService, BuildingHandler],
  controllers: [BuildingController],
})
export class BuildingModule {
}
