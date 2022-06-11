import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Game } from '../game/game.schema';
import { User } from '../user/user.schema';
import { MemberService } from './member.service';

@Injectable()
export class MemberHandler {
  constructor(
    private memberService: MemberService,
  ) {
  }

  @OnEvent('games.*.created')
  async onGameCreated(game: Game): Promise<void> {
    await this.memberService.create(game._id.toString(), game.owner, {
      password: '',
      ready: false,
    });
  }

  @OnEvent('games.*.deleted')
  async onGameDeleted(game: Game): Promise<void> {
    await this.memberService.deleteGame(game._id.toString());
  }

  @OnEvent('users.*.deleted')
  async onUserDelete(user: User): Promise<void> {
    await this.memberService.deleteUser(user._id.toString());
  }
}
