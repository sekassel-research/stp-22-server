import { OmitType } from '@nestjs/swagger';
import { Building } from './building.schema';

export class CreateBuildingDto extends OmitType(Building, [
  'gameId',
  'owner',
] as const) {
}
