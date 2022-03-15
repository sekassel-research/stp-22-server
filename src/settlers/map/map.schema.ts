import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsMongoId, IsOptional, Max, Min, ValidateNested } from 'class-validator';
import { GLOBAL_SCHEMA_WITHOUT_ID_OPTIONS, GlobalSchemaWithoutID, MONGO_ID_FORMAT } from '../../util/schema';
import { RESOURCE_TYPES, ResourceType, TILE_TYPES, TileType } from '../shared/constants';
import { ALL_EDGE_SIDES, AnyEdgeSide, EDGE_SIDES, EdgeSide } from '../shared/hexagon';
import { Point3D } from '../shared/schema';

@Schema()
export class Tile extends Point3D {
  @Prop()
  @ApiProperty({ enum: TILE_TYPES })
  @IsIn(TILE_TYPES)
  type: TileType;

  @Prop()
  @ApiProperty({ type: 'integer', minimum: 2, maximum: 12 })
  @Min(2)
  @Max(12)
  numberToken: number;
}

@Schema()
export class Harbor extends Point3D {
  @Prop()
  @ApiPropertyOptional({ enum: RESOURCE_TYPES })
  @IsOptional()
  @IsIn(RESOURCE_TYPES)
  type?: ResourceType;

  @Prop()
  @ApiProperty({ enum: ALL_EDGE_SIDES })
  @IsIn(ALL_EDGE_SIDES)
  side: AnyEdgeSide;
}

@Schema(GLOBAL_SCHEMA_WITHOUT_ID_OPTIONS)
export class Map extends GlobalSchemaWithoutID {
  @Prop()
  @ApiProperty(MONGO_ID_FORMAT)
  @IsMongoId()
  gameId: string;

  @Prop()
  @ApiProperty({ type: [Tile] })
  @Type(() => Tile)
  @ValidateNested({ each: true })
  tiles: Tile[];

  @Prop()
  @ApiProperty({ type: [Harbor] })
  @Type(() => Harbor)
  @ValidateNested({ each: true })
  harbors: Harbor[];
}

export const MapSchema = SchemaFactory.createForClass(Map)
  .index({ gameId: 1 }, { unique: true })
;
