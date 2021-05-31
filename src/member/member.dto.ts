import { PickType } from '@nestjs/swagger';
import { Member } from './member.schema';

export class CreateMemberDto extends PickType(Member, [] as const) {
}

export class UpdateMemberDto extends PickType(CreateMemberDto, [] as const) {
}
