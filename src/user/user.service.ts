import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { User } from './user.dto';

@Injectable()
export class UserService {
  private online = new Map<string, User>();

  constructor(
    private eventEmitter2: EventEmitter2,
  ) {
  }

  async getOnlineUsers(): Promise<User[]> {
    return [...this.online.values()];
  }

  async getOnlineUser(id: string): Promise<User | undefined> {
    return this.online.get(id);
  }

  async login(user: User) {
    this.online.set(user.id, user);
    this.eventEmitter2.emit('user.online', user);
  }

  async logout(user: User) {
    this.online.delete(user.id);
    this.eventEmitter2.emit('user.offline', user);
  }
}
