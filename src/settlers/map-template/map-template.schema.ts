import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsByteLength,
  IsIn,
  IsInt,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { GLOBAL_SCHEMA_OPTIONS, GlobalSchema, MONGO_ID_FORMAT } from '../../util/schema';
import { IsUrlOrUri } from '../../util/url-or-uri.validator';
import { Harbor } from '../map/map.schema';
import { TILE_TYPES, TileType } from '../shared/constants';
import { Point3D } from '../shared/schema';

export class TileTemplate extends Point3D {
  @Prop()
  @ApiPropertyOptional({ enum: TILE_TYPES })
  @IsOptional()
  @IsIn(TILE_TYPES)
  type?: TileType;

  @Prop()
  @ApiPropertyOptional({ type: 'integer', minimum: 0, maximum: 12 })
  @IsOptional()
  @Min(0)
  @Max(12)
  numberToken?: number;
}

export class HarborTemplate extends Harbor {
}

const MAX_ICON_LENGTH = 64 * 1024;
const MAX_TILES = 100;

@Schema(GLOBAL_SCHEMA_OPTIONS)
export class MapTemplate extends GlobalSchema {
  @Prop()
  @ApiProperty({ minLength: 1, maxLength: 32 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(32)
  name: string;

  @Prop()
  @ApiPropertyOptional({ format: 'url', maxLength: MAX_ICON_LENGTH })
  @IsOptional()
  @IsUrlOrUri()
  @IsByteLength(0, MAX_ICON_LENGTH)
  icon?: string;

  @Prop()
  @ApiProperty(MONGO_ID_FORMAT)
  @IsMongoId()
  createdBy: string;

  @Prop()
  @ApiProperty()
  @IsInt()
  votes: number;

  @Prop()
  @ApiProperty({ type: [TileTemplate], maxItems: MAX_TILES })
  @Type(() => TileTemplate)
  @ValidateNested({ each: true })
  @ArrayMaxSize(MAX_TILES)
  tiles: TileTemplate[];

  @Prop()
  @ApiProperty({ type: [HarborTemplate], maxItems: MAX_TILES })
  @Type(() => HarborTemplate)
  @ValidateNested({ each: true })
  @ArrayMaxSize(MAX_TILES)
  harbors: HarborTemplate[];
}

export const MapTemplateSchema = SchemaFactory.createForClass(MapTemplate);
