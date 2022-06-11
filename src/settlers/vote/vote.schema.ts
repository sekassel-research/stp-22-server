import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId } from 'class-validator';
import { GLOBAL_SCHEMA_WITHOUT_ID_OPTIONS, GlobalSchemaWithoutID, MONGO_ID_FORMAT } from '../../util/schema';

@Schema(GLOBAL_SCHEMA_WITHOUT_ID_OPTIONS)
export class Vote extends GlobalSchemaWithoutID {
  @Prop()
  @ApiProperty(MONGO_ID_FORMAT)
  @IsMongoId()
  mapId: string;

  @Prop()
  @ApiProperty(MONGO_ID_FORMAT)
  @IsMongoId()
  userId: string;
}

export const VoteSchema = SchemaFactory.createForClass(Vote)
  .index({ mapId: 1, userId: 1 }, { unique: true })
;
