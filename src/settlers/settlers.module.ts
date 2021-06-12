import { Module } from '@nestjs/common';
import { MapModule } from './map/map.module';
import { SharedModule } from './shared/shared.module';

@Module({
  imports: [
    MapModule,
    SharedModule,
  ],
})
export class SettlersModule {
}
