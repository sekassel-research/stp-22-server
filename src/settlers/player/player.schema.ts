import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsHexColor,
  IsIn,
  IsInt,
  IsMongoId,
  IsObject,
  IsOptional,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Document, Types } from 'mongoose';
import { GLOBAL_SCHEMA_WITHOUT_ID_OPTIONS, MONGO_ID_FORMAT } from '../../util/schema';
import {
  BUILDING_TYPES,
  BuildingType,
  DEVELOPMENT_TYPES,
  DevelopmentType,
  RESOURCE_TYPES,
  ResourceType,
} from '../shared/constants';

export type ResourceCount = Partial<Record<'unknown' | ResourceType, number>>;
export type BuildingCount = Partial<Record<BuildingType, number>>;

export class DevelopmentCard {
  @Prop()
  @ApiProperty({ type: String, enum: ['unknown', ...DEVELOPMENT_TYPES] })
  @IsIn(DEVELOPMENT_TYPES)
  type: DevelopmentType | 'unknown';

  @Prop()
  @ApiProperty()
  @IsBoolean()
  revealed: boolean;
}

@Schema({ ...GLOBAL_SCHEMA_WITHOUT_ID_OPTIONS, timestamps: false, minimize: false })
export class Player {
  @Prop()
  @ApiProperty(MONGO_ID_FORMAT)
  @IsMongoId()
  gameId: string;

  @Prop()
  @ApiProperty(MONGO_ID_FORMAT)
  @IsMongoId()
  userId: string;

  @Prop()
  @ApiProperty({ format: 'hex-color', example: '#0075ff' })
  @IsHexColor()
  color: string;

  @Prop({ default: true })
  @ApiProperty()
  @IsBoolean()
  active: boolean;

  @Prop()
  @ApiProperty({ type: 'integer', required: false, minimum: 1, maximum: 6 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(6)
  foundingRoll?: number;

  @Prop({ type: Object })
  @ApiProperty({
    type: 'object',
    properties: Object.assign({
      unknown: {
        type: 'integer',
        required: false,
      },
    }, ...RESOURCE_TYPES.map(rt => ({ [rt]: { type: 'integer', required: false } }))),
  })
  @IsObject()
  resources: ResourceCount;

  @Prop({ type: Object })
  @ApiProperty({
    type: 'object',
    properties: Object.assign({}, ...BUILDING_TYPES.map(bt => ({ [bt]: { type: 'integer', required: false } }))),
  })
  @IsObject()
  remainingBuildings: BuildingCount;

  @Prop()
  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  victoryPoints?: number;

  @Prop()
  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  longestRoad?: number;

  @Prop({ type: Object })
  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  previousTradeOffer?: ResourceCount;

  @Prop()
  @ApiPropertyOptional({ type: [DevelopmentCard] })
  @IsOptional()
  @ValidateNested({ each: true})
  @Type(() => DevelopmentCard)
  developmentCards?: DevelopmentCard[];
}

export type PlayerDocument = Player & Document<Types.ObjectId>;

export const PlayerSchema = SchemaFactory.createForClass(Player)
  .index({ gameId: 1, userId: 1 }, { unique: true })
;
