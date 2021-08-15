import { OmitType } from '@nestjs/swagger';
import { Building } from './building.schema';

export class CreateBuildingDto extends OmitType(Building, [
  '_id',
  'gameId',
  'owner',
] as const) {
}
