import { MessageBody, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Observable } from 'rxjs';
import { MessageEvent } from './message.event';
import { MessageService } from './message.service';

@WebSocketGateway(3001, { path: '/ws/messages' })
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
