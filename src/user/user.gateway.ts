import {
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { IncomingMessage } from 'http';
import { Observable } from 'rxjs';
import { takeWhile } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';
import { UserEvent } from './user.event';
import { UserService } from './user.service';

@WebSocketGateway(3002, { path: '/ws/users' })
export class UserGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private authService: AuthService,
    private userService: UserService,
  ) {
  }

  async handleConnection(client: any, message: IncomingMessage): Promise<void> {
    client.user = await this.authService.parseUserForWebSocket(message);
  }

  @SubscribeMessage('login')
  login(@ConnectedSocket() client: any): Observable<UserEvent> {
    const { user } = client;
    this.userService.login(user);
    return this.userService.watch().pipe(takeWhile(m => !(m.event === 'offline' && m.data.id === user.id)));
  }

  @SubscribeMessage('logout')
  logout(@ConnectedSocket() client: any): void {
    this.userService.logout(client.user);
  }

  handleDisconnect(client: any): any {
    this.userService.logout(client.user);
  }
}
