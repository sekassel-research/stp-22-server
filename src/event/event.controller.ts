import { Controller } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { EventService } from './event.service';

@Controller()
export class EventController {
  constructor(
    private eventService: EventService,
  ) {
  }

  @EventPattern('>')
  async onAnyEvent({ event, data, users }) {
    this.eventService.handle(event, data, users);
  }
}
