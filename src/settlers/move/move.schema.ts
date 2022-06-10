import { Prop } from '@nestjs/mongoose';
import { ApiProperty, ApiPropertyOptional, ApiPropertyOptions } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsIn, IsMongoId, IsObject, IsOptional, Max, Min, ValidateNested } from 'class-validator';
import { MONGO_ID_FORMAT } from '../../util/schema';
import { ResourceCount } from '../player/player.schema';
import { RESOURCE_TYPES, Task, TASKS } from '../shared/constants';
import { Point3D } from '../shared/schema';

const RESOURCE_COUNT_OPTIONS: ApiPropertyOptions = {
  type: 'object',
  properties: Object.assign({}, ...RESOURCE_TYPES.map(rt => ({ [rt]: { type: 'integer', required: false } }))),
};

export const BANK_TRADE_ID = '684072366f72202b72406465';

export class RobDto extends Point3D {
  @Prop()
  @ApiProperty(MONGO_ID_FORMAT)
  @IsMongoId()
  target: string;
}

export class Move {
  @ApiProperty(MONGO_ID_FORMAT)
  @IsMongoId()
  _id: string;

  @ApiProperty()
  @IsDate()
  createdAt: Date;

  @ApiProperty(MONGO_ID_FORMAT)
  @IsMongoId()
  gameId: string;

  @ApiProperty(MONGO_ID_FORMAT)
  @IsMongoId()
  userId: string;

  @ApiProperty({ enum: TASKS })
  @IsIn(TASKS)
  action: Task;

  @ApiProperty({ type: 'integer', minimum: 1, maximum: 12, required: false })
  @IsOptional()
  @Min(1)
  @Max(12)
  roll?: number;

  @ApiProperty({ ...MONGO_ID_FORMAT, required: false })
  @IsOptional()
  @IsMongoId()
  building?: string;

  @ApiPropertyOptional({
    description: 'Required if action is "rob".',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => RobDto)
  rob?: RobDto;

  @ApiPropertyOptional({
    ...RESOURCE_COUNT_OPTIONS,
    description: 'Required if action is "drop".',
  })
  @IsOptional()
  @IsObject()
  resources?: ResourceCount;

  @ApiPropertyOptional({
    ...RESOURCE_COUNT_OPTIONS,
    description: 'Required if action is "trade" or "offer". ' +
      'Positive values are given to the player, ' +
      'negative values are taken from the player.',
  })
  @IsOptional()
  @IsObject()
  trade?: ResourceCount;

  @ApiPropertyOptional({
    ...MONGO_ID_FORMAT,
    description: 'To trade with the bank, use action "trade" and set this to ' + BANK_TRADE_ID + '. ' +
      'Otherwise required if action is "accept".',
  })
  @IsOptional()
  @IsMongoId()
  partner?: string;
}
