import { PartialType, PickType } from '@nestjs/swagger';
import { Group } from './group.schema';

export class CreateGroupDto extends PickType(Group, [
  'members',
] as const) {
}

export class UpdateGroupDto extends PartialType(PickType(Group, [
  'members',
] as const)) {
}
