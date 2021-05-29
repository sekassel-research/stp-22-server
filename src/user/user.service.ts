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
    return [...this.online.values()];
  }

  async getOnlineUser(id: string): Promise<User | undefined> {
    return this.online.get(id);
  }

  async login(token: UserToken) {
    const user = this.tokenToUser(token);
    this.online.set(token.id, user);
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

  private tokenToUser({ id, name }: UserToken): User {
    return { id, name };
  }

  watch(): Observable<UserEvent> {
    return this.events;
  }
}
