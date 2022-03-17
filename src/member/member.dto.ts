import { ApiProperty, PartialType, PickType } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { Member } from './member.schema';

class MemberDto extends PickType(Member, [
  'ready',
  'spectator',
] as const) {
}

export class CreateMemberDto extends MemberDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class UpdateMemberDto extends PartialType(MemberDto) {
}
