import { OmitType, PartialType } from '@nestjs/swagger';
import { MapTemplate } from './map-template.schema';

export class CreateMapTemplateDto extends OmitType(MapTemplate, [
  '_id',
  'votes',
  'createdBy',
  'createdAt',
  'updatedAt',
] as const) {
}

export class UpdateMapTemplateDto extends PartialType(CreateMapTemplateDto) {
}
