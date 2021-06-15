import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { environment } from '../environment';
import { EventService } from './event.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'EVENT_SERVICE',
        transport: Transport.NATS,
        options: environment.nats,
      },
    ]),
  ],
  providers: [EventService],
  exports: [EventService],
})
export class EventModule {
}
