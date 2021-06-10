import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SettlersController } from './settlers.controller';
import { MapSchema } from './settlers.schema';
import { SettlersService } from './settlers.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'maps',
        schema: MapSchema,
      },
    ]),
  ],
  controllers: [SettlersController],
  providers: [SettlersService],
})
export class SettlersModule {
}
