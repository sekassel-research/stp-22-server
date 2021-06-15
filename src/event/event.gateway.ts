import { Inject } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ClientNats, ClientProxy } from '@nestjs/microservices';
import { OnGatewayConnection, SubscribeMessage, WebSocketGateway, WsResponse } from '@nestjs/websockets';
import { IncomingMessage } from 'http';
import { Client } from 'nats';
import { Observable, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';
import { environment } from '../environment';

@WebSocketGateway({ path: `/ws/${environment.version}/events` })
export class EventGateway implements OnGatewayConnection {
  constructor(
    @Inject('EVENT_SERVICE') private client: ClientNats,
    private eventEmitter: EventEmitter2,
    private authService: AuthService,
  ) {
  }

  private unsubscribeRequests = new Subject<{ client: any, event: string }>();

  async handleConnection(client: any, message: IncomingMessage): Promise<void> {
    try {
      client.user = await this.authService.parseUserForWebSocket(message);
    } catch (err) {
      client.send(JSON.stringify(err));
      client.close();
    }
  }

  @SubscribeMessage('subscribe')
  subscribe(client: any, event: string): Observable<WsResponse<unknown>> {
    return this.observe(client, event).pipe(
      takeUntil(this.unsubscribeRequests.pipe(filter(unsub => unsub.client === client && unsub.event === event))),
    );
  }

  private observe<T>(client: any, event: string): Observable<WsResponse<T>> {
    return new Observable<WsResponse<T>>(observer => {
      const nats = ((this.client as any).natsClient) as Client;
      const sid = nats.subscribe(event, message => {
        const event = message.pattern;
        const { data, users } = message.data;
        if (users && !users.includes(client.user._id)) {
          return;
        }
        observer.next({
          event,
          data,
        });
      });
      return () => nats.unsubscribe(sid);
    });
  }

  @SubscribeMessage('unsubscribe')
  unsubscribe(client: any, event: string): void {
    this.unsubscribeRequests.next({ client, event });
  }
}
