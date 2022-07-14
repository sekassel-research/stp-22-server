import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty, ApiPropertyOptional, ApiPropertyOptions, OmitType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsMongoId, IsObject, IsOptional, Max, Min, ValidateNested } from 'class-validator';
import { GLOBAL_SCHEMA_OPTIONS, GlobalSchema, MONGO_ID_FORMAT } from '../../util/schema';
import { ResourceCount } from '../player/player.schema';
import { DEVELOPMENT_TYPES, DevelopmentType, RESOURCE_TYPES, Task, TASKS } from '../shared/constants';
import { Point3D } from '../shared/schema';

const RESOURCE_COUNT_OPTIONS: ApiPropertyOptions = {
  type: 'object',
  properties: Object.assign({}, ...RESOURCE_TYPES.map(rt => ({ [rt]: { type: 'integer', required: false } }))),
};

export const BANK_TRADE_ID = '684072366f72202b72406465';

export class RobDto extends Point3D {
  @Prop()
  @ApiPropertyOptional(MONGO_ID_FORMAT)
  @IsOptional()
  @IsMongoId()
  target?: string;
}

@Schema({ ...GLOBAL_SCHEMA_OPTIONS, timestamps: { createdAt: true, updatedAt: false } })
export class Move extends OmitType(GlobalSchema, ['updatedAt'] as const) {
  @Prop()
  @ApiProperty(MONGO_ID_FORMAT)
  @IsMongoId()
  gameId: string;

  @Prop()
  @ApiProperty(MONGO_ID_FORMAT)
  @IsMongoId()
  userId: string;

  @Prop()
  @ApiProperty({ enum: TASKS })
  @IsIn(TASKS)
  action: Task;

  @Prop()
  @ApiProperty({ type: 'integer', minimum: 1, maximum: 12, required: false })
  @IsOptional()
  @Min(1)
  @Max(12)
  roll?: number;

  @Prop()
  @ApiProperty({ ...MONGO_ID_FORMAT, required: false })
  @IsOptional()
  @IsMongoId()
  building?: string;

  @Prop()
  @ApiPropertyOptional({
    description: 'Required if action is "rob", ' +
      'or "build" with developmentCard "knight".',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => RobDto)
  rob?: RobDto;

  @Prop({ type: Object })
  @ApiPropertyOptional({
    ...RESOURCE_COUNT_OPTIONS,
    description: 'Required if action is "drop" or "offer" or "monopoly" or "year-of-plenty". ' +
      'Can be used with "build" action to initiate a trade. ' +
      'Positive values are given to the player, ' +
      'negative values are taken from the player.',
  })
  @IsOptional()
  @IsObject()
  resources?: ResourceCount;

  @Prop()
  @ApiPropertyOptional({
    ...MONGO_ID_FORMAT,
    description: 'To trade with the bank, use action "build" and set this to ' + BANK_TRADE_ID + '. ' +
      'Otherwise required if action is "accept".',
  })
  @IsOptional()
  @IsMongoId()
  partner?: string;

  @Prop({ type: String })
  @ApiPropertyOptional({
    description: 'Can be used with the "build" action to buy or play a development card.',
    enum: ['new', ...DEVELOPMENT_TYPES],
  })
  @IsOptional()
  @IsIn(['new', ...DEVELOPMENT_TYPES.filter(s => s !== 'victory-point')])
  developmentCard?: 'new' | Exclude<DevelopmentType, 'victory-point'>;
}


export const MoveSchema = SchemaFactory.createForClass(Move)
  .index({ gameId: 1 })
;
