import { Injectable } from '@nestjs/common';
import { Game } from '../game/game.schema';
import { Group } from '../group/group.schema';
import { GroupService } from '../group/group.service';
import { MemberService } from '../member/member.service';

export enum Namespace {
  groups = 'groups',
  games = 'games',
}

@Injectable()
export class MemberResolverService {
  constructor(
    private groupService: GroupService,
    private memberService: MemberService,
  ) {
  }

  async resolveFrom(entity: Game | Group): Promise<[Namespace, string[]] | undefined> {
    if ('owner' in entity) {
      return [Namespace.games, await this.getGameMembers(entity._id)];
    } else if ('members' in entity) {
      return [Namespace.groups, entity.members];
    } else {
      return undefined;
    }
  }

  async resolve(namespace: Namespace, id: string): Promise<string[]> {
    switch (namespace) {
      case Namespace.groups:
        const group = await this.groupService.find(id);
        return group?.members ?? [];
      case Namespace.games:
        return this.getGameMembers(id);
      default:
        return [];
    }
  }

  private async getGameMembers(id: string) {
    const members = await this.memberService.findAll(id);
    return members.map(member => member.userId);
  }
}
