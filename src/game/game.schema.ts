import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Document, Types } from 'mongoose';
import { GLOBAL_SCHEMA_OPTIONS, GlobalSchema, MONGO_ID_FORMAT } from '../util/schema';

export class GameSettings {
  @Prop()
  @ApiPropertyOptional({
    type: 'integer',
    minimum: 0,
    maximum: 10,
    default: 2,
    description: 'Controls the number of rings around the center of the map. Zero means only one tile will be placed.',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10)
  mapRadius?: number;

  @Prop()
  @ApiPropertyOptional({
    type: 'integer',
    minimum: 3,
    default: 10,
    description: 'Specifies how many victory points are required to win the game.',
  })
  @IsOptional()
  @IsInt()
  @Min(3)
  victoryPoints?: number;
}

@Schema(GLOBAL_SCHEMA_OPTIONS)
export class Game extends GlobalSchema {
  @Prop({ index: 1 })
  @ApiProperty({ minLength: 1, maxLength: 32 })
  @IsNotEmpty()
  @MaxLength(32)
  name: string;

  @Prop()
  @ApiProperty(MONGO_ID_FORMAT)
  @IsMongoId()
  owner: string;

  @Prop({ default: 0 })
  @ApiProperty()
  @IsNumber()
  members: number;

  @Prop()
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  started?: boolean;

  @Prop()
  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => GameSettings)
  settings?: GameSettings;

  @Prop({
    transform: () => undefined,
  })
  passwordHash: string;
}

export type GameDocument = Game & Document<Types.ObjectId>;

export const GameSchema = SchemaFactory.createForClass(Game);
