import { JwtService } from '@nestjs/jwt';
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
import { UserToken } from './user.dto';
import { UserEvent } from './user.event';
import { UserService } from './user.service';

@WebSocketGateway(3002, { path: '/ws/users' })
export class UserGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
  ) {
  }

  handleConnection(client: any, message: IncomingMessage): any {
    const token = this.getToken(message);
    if (token) {
      client.user = this.jwtService.verify(token) as UserToken;
    }
  }

  private getToken(message: IncomingMessage): string | undefined {
    const authHeader = message.headers.authorization;
    if (authHeader) {
      const headerToken = authHeader.startsWith('Bearer ') ? authHeader.substring('Bearer '.length) : undefined;
      if (headerToken) {
        return headerToken;
      }
    }
    const url = new URL(`http://localhost${message.url}`);
    const queryToken = url.searchParams.get('authToken');
    return queryToken ?? undefined;
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
