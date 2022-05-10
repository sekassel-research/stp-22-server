import { Injectable } from '@nestjs/common';
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
