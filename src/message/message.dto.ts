import { PickType } from '@nestjs/swagger';
import { Message } from './message.schema';

export class CreateMessageDto extends PickType(Message, [
  'body',
] as const) {
}

export class UpdateMessageDto extends PickType(Message, [
  'body',
] as const) {
}
