import { EventEmitter2 } from '@nestjs/event-emitter';
import { OnGatewayConnection, SubscribeMessage, WebSocketGateway, WsResponse } from '@nestjs/websockets';
import { IncomingMessage } from 'http';
import { Observable, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { AuthService } from './auth/auth.service';

@WebSocketGateway({ path: '/ws' })
export class AppGateway implements OnGatewayConnection {
  constructor(
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
      const handler = function(data: T, users?: string[]) {
        if (users && !users.includes(client.user.id)) {
          return;
        }
        observer.next({
          event: this.event,
          data,
        });
      };
      this.eventEmitter.on(event, handler);
      return () => this.eventEmitter.off(event, handler);
    });
  }

  @SubscribeMessage('unsubscribe')
  unsubscribe(client: any, event: string): void {
    this.unsubscribeRequests.next({ client, event });
  }
}
