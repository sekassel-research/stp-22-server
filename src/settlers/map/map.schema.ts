import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsMongoId, Max, Min, ValidateNested } from 'class-validator';
import { GLOBAL_SCHEMA_OPTIONS, MONGO_ID_FORMAT } from '../../util/schema';
import { TILE_TYPES, TileType } from '../shared/constants';
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

@Schema({
  ...GLOBAL_SCHEMA_OPTIONS,
  id: false,
})
export class Map {
  @Prop()
  @ApiProperty(MONGO_ID_FORMAT)
  @IsMongoId()
  gameId: string;

  @Prop()
  @ApiProperty({ type: [Tile] })
  @Type(() => Tile)
  @ValidateNested({ each: true })
  tiles: Tile[];
}

export const MapSchema = SchemaFactory.createForClass(Map)
  .set('toJSON', {
    virtuals: true,
    transform: (doc, converted) => {
      delete converted._id;
      delete converted.id;
    },
  });
