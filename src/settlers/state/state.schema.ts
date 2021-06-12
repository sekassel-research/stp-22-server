import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId } from 'class-validator';
import { GLOBAL_SCHEMA_WITHOUT_ID_OPTIONS, MONGO_ID_FORMAT } from '../../util/schema';

@Schema({ ...GLOBAL_SCHEMA_WITHOUT_ID_OPTIONS, timestamps: false })
export class State {
  @Prop()
  @ApiProperty(MONGO_ID_FORMAT)
  @IsMongoId()
  gameId: string;
}

export const StateSchema = SchemaFactory.createForClass(State)
  .index({ gameId: 1 }, { unique: true })
;
