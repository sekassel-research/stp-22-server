import { MessageBody, SubscribeMessage, WebSocketGateway, WsResponse } from '@nestjs/websockets';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MessageEvent } from './message.event';
import { Message } from './message.schema';
import { MessageService } from './message.service';

@WebSocketGateway({path: '/ws/messages'})
export class MessageGateway {
  constructor(
    private messageService: MessageService,
  ) {
  }

  @SubscribeMessage('watch')
  subscribe(@MessageBody() senderOrReceiver: string): Observable<MessageEvent> {
    return this.messageService.stream(senderOrReceiver);
  }
}
