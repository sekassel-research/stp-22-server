import { Injectable } from '@nestjs/common';
import { Observable, Subject } from 'rxjs';
import { User } from '../auth/auth.interface';
import { UserEvent } from './user.event';

@Injectable()
export class UserService {
  private online = new Map<string, User>();
  private events = new Subject<UserEvent>();

  async getOnlineUsers(): Promise<User[]> {
    return [...this.online.values()];
  }

  async login(user: User) {
    this.online.set(user.id, user);
    this.events.next({
      event: 'online',
      data: {
        id: user.id,
        name: user.name,
      },
    });
  }

  async logout(user: string | User) {
    if (typeof user === 'string') {
      user = this.online.get(user);
      if (!user) {
        return;
      }
    }

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
