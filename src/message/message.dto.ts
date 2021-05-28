import { PickType } from '@nestjs/swagger';
import { Message } from './message.schema';

export class CreateMessageDto extends PickType(Message, [
  'sender',
  'receiver',
  'body',
] as const) {
}

export class PutMessageDto extends PickType(Message, [
  'body',
] as const) {
}
