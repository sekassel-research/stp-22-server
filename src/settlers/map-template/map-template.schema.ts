import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty, ApiPropertyOptional, IntersectionType, OmitType, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsMongoId, IsNotEmpty, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';
import { GLOBAL_SCHEMA_OPTIONS, GlobalSchema, MONGO_ID_FORMAT } from '../../util/schema';
import { Harbor, Tile } from '../map/map.schema';
import { Point3D } from '../shared/schema';

export class TileTemplate extends IntersectionType(Point3D, PartialType(OmitType(Tile, ['x', 'y', 'z'] as const))) {
}

export class HarborTemplate extends Harbor {
}

@Schema(GLOBAL_SCHEMA_OPTIONS)
export class MapTemplate extends GlobalSchema {
  @Prop()
  @ApiProperty({minLength: 1, maxLength: 32})
  @IsString()
  @IsNotEmpty()
  @MaxLength(32)
  name: string;

  @Prop()
  @ApiProperty(MONGO_ID_FORMAT)
  @IsMongoId()
  createdBy: string;

  @Prop()
  @ApiProperty()
  @IsInt()
  votes: number;

  @Prop()
  @ApiPropertyOptional({ type: [TileTemplate] })
  @IsOptional()
  @Type(() => TileTemplate)
  @ValidateNested({ each: true })
  tiles?: TileTemplate[];

  @Prop()
  @ApiPropertyOptional({ type: [HarborTemplate] })
  @IsOptional()
  @Type(() => HarborTemplate)
  @ValidateNested({ each: true })
  harbors?: HarborTemplate[];
}

export const MapTemplateSchema = SchemaFactory.createForClass(MapTemplate);
