import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsMongoId } from 'class-validator';
import { Document, Types } from 'mongoose';
import { GLOBAL_SCHEMA_WITHOUT_ID_OPTIONS, GlobalSchemaWithoutID, MONGO_ID_FORMAT } from '../util/schema';

@Schema(GLOBAL_SCHEMA_WITHOUT_ID_OPTIONS)
export class Member extends GlobalSchemaWithoutID {
  @Prop()
  @ApiProperty(MONGO_ID_FORMAT)
  @IsMongoId()
  gameId: string;

  @Prop()
  @ApiProperty(MONGO_ID_FORMAT)
  @IsMongoId()
  userId: string;

  @Prop()
  @ApiProperty()
  @IsBoolean()
  ready: boolean;
}

export type MemberDocument = Member & Document<Types.ObjectId>;

export const MemberSchema = SchemaFactory.createForClass(Member)
  .index({ gameId: 1, userId: 1 }, { unique: true })
;
