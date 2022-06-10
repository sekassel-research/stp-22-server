import { Prop } from '@nestjs/mongoose';
import { ApiProperty, OmitType, PickType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, ValidateNested } from 'class-validator';
import { CreateBuildingDto } from '../building/building.dto';
import { Move } from './move.schema';

export class CreateMoveDto extends PickType(Move, [
  'action',
  'resources',
  'rob',
  'partner',
] as const) {
  @Prop()
  @ApiProperty({
    type: CreateBuildingDto,
    required: false,
    description:
      'If set, the building will be placed and the player will stay in turn. ' +
      'If unset, the current player\'s turn ends.',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateBuildingDto)
  building?: CreateBuildingDto;
}

export class MoveDto extends OmitType(Move, [
  '_id',
  'createdAt',
] as const) {
}
