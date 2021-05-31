import { EventEmitter2 } from '@nestjs/event-emitter';
import { SubscribeMessage, WebSocketGateway, WsResponse } from '@nestjs/websockets';
import { Observable, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

@WebSocketGateway({ path: '/ws' })
export class AppGateway {
  constructor(
    private eventEmitter: EventEmitter2,
  ) {
  }

  private unsubscribeRequests = new Subject<{ client: any, event: string }>();

  @SubscribeMessage('subscribe')
  subscribe(client: any, event: string): Observable<WsResponse<unknown>> {
    return this.observe(event).pipe(
      takeUntil(this.unsubscribeRequests.pipe(filter(unsub => unsub.client === client && unsub.event === event))),
    );
  }

  private observe<T>(event: string): Observable<WsResponse<T>> {
    return new Observable<WsResponse<T>>(observer => {
      const handler = function(data: T) {
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
