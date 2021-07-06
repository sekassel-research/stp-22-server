import { Injectable } from '@nestjs/common';
import { Group } from '../group/group.schema';
import { GroupService } from '../group/group.service';

@Injectable()
export class MemberResolverService {
  constructor(
    private groupService: GroupService,
  ) {
  }

  async resolveFrom(entity: Group): Promise<[string, string[]] | undefined> {
    if ('members' in entity) {
      return ['groups', entity.members];
    } else {
      return undefined;
    }
  }

  async resolve(namespace: string, id: string): Promise<string[]> {
    switch (namespace) {
      case 'groups':
        const group = await this.groupService.find(id);
        return group?.members ?? [];
      default:
        return [];
    }
  }
}
