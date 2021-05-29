import { Injectable } from '@nestjs/common';
import { Observable, Subject } from 'rxjs';
import { User, UserToken } from './user.dto';
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

  async login(token: UserToken) {
    const user = this.tokenToUser(token);
    this.online.set(user.id, user);
    this.events.next({
      event: 'online',
      data: user,
    });
  }

  async logout(token: UserToken) {
    const user = this.tokenToUser(token);
    this.online.delete(user.id);
    this.events.next({
      event: 'offline',
      data: user,
    });
  }

  private tokenToUser({ sub, preferred_username }: UserToken): User {
    return {
      id: sub,
      name: preferred_username,
    };
  }

  watch(): Observable<UserEvent> {
    return this.events;
  }
}
