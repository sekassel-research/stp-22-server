import { UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
import { BaseWsExceptionFilter, MessageBody, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Observable } from 'rxjs';
import { CreateMessageDto } from './message.dto';
import { MessageEvent } from './message.event';
import { MessageService } from './message.service';

@WebSocketGateway(3001, { path: '/ws/messages' })
@UsePipes(ValidationPipe)
@UseFilters(new BaseWsExceptionFilter())
export class MessageGateway {
  constructor(
    private messageService: MessageService,
  ) {
  }

  @SubscribeMessage('watch')
  subscribe(@MessageBody() senderOrReceiver: string): Observable<MessageEvent> {
    return this.messageService.stream(senderOrReceiver);
  }

  @SubscribeMessage('post')
  async send(@MessageBody() message: CreateMessageDto): Promise<void> {
    await this.messageService.post(message);
  }
}
