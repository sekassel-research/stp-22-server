import { MessageBody, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';
import { UserEvent } from './user.event';
import { UserService } from './user.service';

@WebSocketGateway({ path: '/ws/users' })
export class UserGateway {
  constructor(
    private authService: AuthService,
    private userService: UserService,
  ) {
  }

  @SubscribeMessage('login')
  handleMessage(@MessageBody() token: string): Observable<UserEvent> {
    const user = this.authService.parseToken(token);
    this.userService.login(user);
    return this.userService.watch().pipe(tap({
      complete: () => {
        this.userService.logout(user);
      },
    }));
  }
}
