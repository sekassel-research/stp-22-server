import { ApiProperty, PartialType, PickType } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { Member } from './member.schema';

export class CreateMemberDto extends PickType(Member, [] as const) {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class UpdateMemberDto extends PartialType(PickType(Member, [] as const)) {
}
