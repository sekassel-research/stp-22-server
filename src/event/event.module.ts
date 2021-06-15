import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AuthModule } from '../auth/auth.module';
import { environment } from '../environment';
import { EventGateway } from './event.gateway';
import { EventService } from './event.service';
import { EventController } from './event.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'EVENT_SERVICE',
        transport: Transport.NATS,
        options: environment.nats,
      },
    ]),
    AuthModule,
  ],
  providers: [EventService, EventGateway],
  exports: [EventService],
  controllers: [EventController],
})
export class EventModule {
}
