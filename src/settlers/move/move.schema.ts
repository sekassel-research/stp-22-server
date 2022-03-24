import { Prop } from '@nestjs/mongoose';
import { ApiProperty, ApiPropertyOptional, ApiPropertyOptions } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsMongoId, IsObject, IsOptional, Max, Min, ValidateNested } from 'class-validator';
import { MONGO_ID_FORMAT } from '../../util/schema';
import { ResourceCount } from '../player/player.schema';
import { RESOURCE_TYPES, ResourceType, Task, TASKS } from '../shared/constants';
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

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => RobDto)
  rob?: RobDto;

  @Prop({ type: Object })
  @ApiPropertyOptional(RESOURCE_COUNT_OPTIONS)
  @IsOptional()
  @IsObject()
  resources?: ResourceCount;

  @Prop({ type: Object })
  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  trade?: ResourceCount;

  @Prop()
  @ApiPropertyOptional({ ...MONGO_ID_FORMAT, description: `Player User ID or ${BANK_TRADE_ID} for bank trade` })
  @IsOptional()
  @IsMongoId()
  partner?: string;
}
