import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Game } from '../game/game.schema';
import { Group } from '../group/group.schema';
import { MemberResolverService, Namespace } from '../member-resolver/member-resolver.service';
import { MessageService } from './message.service';

@Injectable()
export class MessageHandler {
  constructor(
    private messageService: MessageService,
    private memberResolver: MemberResolverService,
  ) {
  }

  @OnEvent('games.*.deleted')
  async onGameDeleted(game: Game): Promise<void> {
    return this.onDelete(Namespace.games, game);
  }

  @OnEvent('groups.*.deleted')
  async onGroupDeleted(group: Group): Promise<void> {
    return this.onDelete(Namespace.groups, group);
  }

  private async onDelete(namespace: Namespace, entity: any): Promise<void> {
    const { _id } = entity;
    const members = await this.memberResolver.resolve(namespace, _id);
    await this.messageService.deleteAll(namespace, _id, members);
  }
}
