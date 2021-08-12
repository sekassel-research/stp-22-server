import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsMongoId, IsOptional, Max, Min } from 'class-validator';
import { MONGO_ID_FORMAT } from '../../util/schema';
import { CreateBuildingDto } from '../building/building.dto';
import { Building } from '../building/building.schema';
import { Task, TASKS } from '../shared/constants';

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

  @ApiProperty({ type: CreateBuildingDto, required: false })
  @IsOptional()
  building?: CreateBuildingDto;
}
