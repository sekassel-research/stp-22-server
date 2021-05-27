import { WsResponse } from '@nestjs/websockets';
import { MessageDocument } from './message.schema';

export interface MessageEvent extends WsResponse<MessageDocument> {
  event: 'created' | 'updated' | 'deleted';
  data: MessageDocument;
}
