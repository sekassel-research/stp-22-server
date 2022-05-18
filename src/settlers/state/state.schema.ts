import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsMongoId, IsOptional, ValidateNested } from 'class-validator';
import { GLOBAL_SCHEMA_WITHOUT_ID_OPTIONS, MONGO_ID_ARRAY_FORMAT, MONGO_ID_FORMAT } from '../../util/schema';
import { Task, TASKS } from '../shared/constants';
import { Point3D } from '../shared/schema';

export class ExpectedMove {
  @Prop()
  @ApiProperty({ enum: TASKS })
  @IsIn(TASKS)
  action: Task;

  @Prop()
  @ApiProperty({
    ...MONGO_ID_ARRAY_FORMAT,
    description: 'The players that may perform the move (in any order).',
  })
  @IsMongoId({ each: true })
  players: string[];
}

@Schema({ ...GLOBAL_SCHEMA_WITHOUT_ID_OPTIONS, timestamps: false })
export class State {
  @Prop()
  @ApiProperty(MONGO_ID_FORMAT)
  @IsMongoId()
  gameId: string;

  @Prop()
  @ApiProperty({
    description: 'The next possible moves, including known future moves.',
    type: [ExpectedMove],
  })
  @ValidateNested({ each: true })
  @Type(() => ExpectedMove)
  expectedMoves: ExpectedMove[];

  @Prop()
  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => Point3D)
  robber?: Point3D;
}

export const StateSchema = SchemaFactory.createForClass(State)
  .index({ gameId: 1 }, { unique: true })
;
