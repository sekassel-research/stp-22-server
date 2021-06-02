import { Injectable } from '@nestjs/common';
import { GroupService } from '../group/group.service';
import { MemberService } from '../member/member.service';

@Injectable()
export class MemberResolverService {
  constructor(
    private groupService: GroupService,
    private memberService: MemberService,
  ) {
  }

  async resolve(namespace: string, id: string): Promise<string[]> {
    switch (namespace) {
      case 'groups':
        const group = await this.groupService.find(id);
        return group?.members ?? [];
      case 'games':
        const members = await this.memberService.findAll(id);
        return members.map(member => member.userId);
    }
  }
}
