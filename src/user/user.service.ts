import { Injectable } from '@nestjs/common';
import { Observable, Subject } from 'rxjs';
import { UserToken } from '../auth/auth.interface';
import { User } from './user.dto';
import { UserEvent } from './user.event';

@Injectable()
export class UserService {
  private online = new Map<string, User>();
  private events = new Subject<UserEvent>();

  async getOnlineUsers(): Promise<User[]> {
    return [...this.online.values()].map(({id, name}) => ({id, name}));
  }

  async login(user: UserToken) {
    this.online.set(user.id, user);
    this.events.next({
      event: 'online',
      data: {
        id: user.id,
        name: user.name,
      },
    });
  }

  async logout(user: UserToken) {
    this.online.delete(user.id);
    this.events.next({
      event: 'offline',
      data: {
        id: user.id,
        name: user.name,
      },
    });
  }

  watch(): Observable<UserEvent> {
    return this.events;
  }
}
