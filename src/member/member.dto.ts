import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { PartialType } from '../util/partial-type';
import { Member } from './member.schema';

export class MemberDto extends PickType(Member, [
  'ready',
  'color',
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
