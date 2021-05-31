import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { Member } from './member.schema';

export class CreateMemberDto extends PickType(Member, [] as const) {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class UpdateMemberDto extends PickType(CreateMemberDto, [] as const) {
}
