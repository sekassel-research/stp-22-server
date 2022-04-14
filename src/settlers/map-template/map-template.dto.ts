import { OmitType, PartialType } from '@nestjs/swagger';
import { MapTemplate } from './map-template.schema';

export class CreateMapTemplateDto extends OmitType(MapTemplate, [
  '_id',
] as const) {
}

export class UpdateMapTemplateDto extends PartialType(CreateMapTemplateDto) {
}
