import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { User } from '../user/user.schema';
import { GameService } from './game.service';

@Injectable()
export class GameHandler {
  constructor(
    private gameService: GameService,
  ) {
  }

  @OnEvent('users.*.deleted')
  async onUserDeleted(user: User): Promise<void> {
    await this.gameService.deleteUser(user._id);
  }
}
