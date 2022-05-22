import { PickType } from '@nestjs/swagger';
import { PartialType } from '../util/partial-type';
import { Group } from './group.schema';

export class CreateGroupDto extends PickType(Group, [
  'name',
  'members',
] as const) {
}

export class UpdateGroupDto extends PartialType(CreateGroupDto) {
}
