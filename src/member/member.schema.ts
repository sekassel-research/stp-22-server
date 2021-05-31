import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsUUID } from 'class-validator';
import { Document } from 'mongoose';
import { GLOBAL_SCHEMA_OPTIONS, GlobalSchema } from '../util/schema';

@Schema({
  ...GLOBAL_SCHEMA_OPTIONS,
  id: false,
})
export class Member extends GlobalSchema {
  @Prop()
  @ApiProperty({ format: 'objectid', example: '507f191e810c19729de860ea' })
  @IsMongoId()
  gameId: string;

  @Prop()
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  userId: string;
}

export type MemberDocument = Member & Document;

export const MemberSchema = SchemaFactory.createForClass(Member)
  .index({ gameId: 1, userId: 1 }, { unique: true })
;
