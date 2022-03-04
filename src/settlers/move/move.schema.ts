import { Prop } from '@nestjs/mongoose';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsMongoId, IsObject, IsOptional, Max, Min } from 'class-validator';
import { MONGO_ID_FORMAT } from '../../util/schema';
import { ResourceCount } from '../player/player.schema';
import { RESOURCE_TYPES, Task, TASKS } from '../shared/constants';

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

  @Prop({ type: Object })
  @ApiPropertyOptional({
    type: 'object',
    properties: Object.assign({}, ...RESOURCE_TYPES.map(rt => ({ [rt]: { type: 'integer', required: false } }))),
  })
  @IsOptional()
  @IsObject()
  resources?: ResourceCount;
}
