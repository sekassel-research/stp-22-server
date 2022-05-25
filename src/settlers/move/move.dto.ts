import { Prop } from '@nestjs/mongoose';
import { ApiProperty, OmitType, PickType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { CreateBuildingDto } from '../building/building.dto';
import { Move } from './move.schema';

export class CreateMoveDto extends PickType(Move, [
  'action',
] as const) {
  @Prop()
  @ApiProperty({
    type: CreateBuildingDto,
    required: false,
    description: 'Ignored if action is not `build`. ' +
      'If set, the building will be placed and the player will stay in turn. ' +
      'If unset, the current player\'s turn ends.',
  })
  @IsOptional()
  @Type(() => CreateBuildingDto)
  building?: CreateBuildingDto;
}

export class MoveDto extends OmitType(Move, [
  '_id',
  'createdAt',
] as const) {
}
