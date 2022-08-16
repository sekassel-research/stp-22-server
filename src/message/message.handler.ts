import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Game } from '../game/game.schema';
import { Group } from '../group/group.schema';
import { MemberResolverService, Namespace } from '../member-resolver/member-resolver.service';
import { MapTemplate } from '../settlers/map-template/map-template.schema';
import { GlobalSchema } from '../util/schema';
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

  @OnEvent('maps.*.deleted')
  async onMapDeleted(map: MapTemplate): Promise<void> {
    return this.onDelete(Namespace.maps, map);
  }

  private async onDelete(namespace: Namespace, entity: GlobalSchema): Promise<void> {
    const id = entity._id.toString();
    const members = await this.memberResolver.resolve(namespace, id);
    await this.messageService.deleteAll(namespace, id, members);
  }
}
