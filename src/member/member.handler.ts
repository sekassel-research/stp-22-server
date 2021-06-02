import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Game } from '../game/game.schema';
import { MemberService } from './member.service';

@Injectable()
export class MemberHandler {
  constructor(
    private memberService: MemberService,
  ) {
  }

  @OnEvent('games.*.created')
  async onGameCreated(game: Game): Promise<void> {
    await this.memberService.create(game._id, game.owner, { password: undefined });
  }

  @OnEvent('games.*.deleted')
  async onGameDeleted(game: Game): Promise<void> {
    await this.memberService.deleteAll(game._id);
  }
}
