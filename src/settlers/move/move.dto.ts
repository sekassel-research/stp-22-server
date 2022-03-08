import { Prop } from '@nestjs/mongoose';
import { ApiProperty, OmitType, PickType } from '@nestjs/swagger';
import { CreateBuildingDto } from '../building/building.dto';
import { Move } from './move.schema';

export class CreateMoveDto extends PickType(Move, [
  'action',
  'resources',
  'rob',
] as const) {
  @Prop()
  @ApiProperty({ type: CreateBuildingDto, required: false })
  building?: CreateBuildingDto;
}

export class MoveDto extends OmitType(Move, [
  '_id',
] as const) {
}
