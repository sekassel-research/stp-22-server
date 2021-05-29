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
import { AuthService } from '../auth/auth.service';
import { JwtStrategy } from '../auth/jwt.strategy';
import { UserToken } from '../auth/user-token.interface';
import { UserEvent } from './user.event';
import { UserService } from './user.service';

@WebSocketGateway(3002, { path: '/ws/users' })
export class UserGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private jwtService: JwtService,
    private jwtStrategy: JwtStrategy,
    private userService: UserService,
  ) {
  }

  async handleConnection(client: any, message: IncomingMessage): Promise<void> {
    const token = this.getToken(message);
    if (token) {
      const parsedToken = this.jwtService.verify(token);
      client.user = await this.jwtStrategy.validate(parsedToken);
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
