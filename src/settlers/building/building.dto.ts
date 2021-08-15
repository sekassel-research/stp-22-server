import { OmitType, PickType } from '@nestjs/swagger';
import { Building } from './building.schema';

export class CreateBuildingDto extends OmitType(Building, [
  '_id',
  'gameId',
  'owner',
] as const) {
}

export class UpdateBuildingDto extends PickType(Building, [
  'type',
] as const) {
}
