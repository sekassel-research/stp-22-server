import { Injectable } from '@nestjs/common';
import { Observable, Subject } from 'rxjs';
import { UserToken } from '../auth/user-token.interface';
import { User } from './user.dto';
import { UserEvent } from './user.event';

@Injectable()
export class UserService {
  private online = new Map<string, User>();
  private events = new Subject<UserEvent>();

  async getOnlineUsers(): Promise<User[]> {
    return [...this.online.values()];
  }

  async getOnlineUser(id: string): Promise<User | undefined> {
    return this.online.get(id);
  }

  async login(user: User) {
    this.online.set(user.id, user);
    this.events.next({
      event: 'online',
      data: user,
    });
  }

  async logout(user: User) {
    this.online.delete(user.id);
    this.events.next({
      event: 'offline',
      data: user,
    });
  }

  watch(): Observable<UserEvent> {
    return this.events;
  }
}
