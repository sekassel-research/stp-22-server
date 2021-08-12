import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsInt, IsMongoId } from 'class-validator';
import { GLOBAL_SCHEMA_WITHOUT_ID_OPTIONS, MONGO_ID_ARRAY_FORMAT, MONGO_ID_FORMAT } from '../../util/schema';
import { Task, TASKS } from '../shared/constants';

@Schema({ ...GLOBAL_SCHEMA_WITHOUT_ID_OPTIONS, timestamps: false })
export class State {
  @Prop()
  @ApiProperty(MONGO_ID_FORMAT)
  @IsMongoId()
  gameId: string;

  @Prop()
  @ApiProperty({ type: 'integer' })
  @IsInt()
  round: number;

  @Prop()
  @ApiProperty(MONGO_ID_FORMAT)
  @IsMongoId()
  activePlayer: string;

  @Prop()
  @ApiProperty(MONGO_ID_ARRAY_FORMAT)
  @IsMongoId({ each: true })
  nextPlayers: string[];

  @Prop()
  @ApiProperty({ enum: TASKS })
  @IsIn(TASKS)
  activeTask: Task;
}

export const StateSchema = SchemaFactory.createForClass(State)
  .index({ gameId: 1 }, { unique: true })
;
