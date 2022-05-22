import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { PartialType } from '../util/partial-type';
import { Member } from './member.schema';

export class CreateMemberDto extends PickType(Member, ['ready'] as const) {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class UpdateMemberDto extends PartialType(PickType(Member, ['ready'] as const)) {
}
