import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty, OmitType } from '@nestjs/swagger';
import { IsMongoId, IsUUID } from 'class-validator';
import { Document } from 'mongoose';
import { GLOBAL_SCHEMA_OPTIONS, GlobalSchema } from '../util/schema';

@Schema(GLOBAL_SCHEMA_OPTIONS)
export class Member extends OmitType(GlobalSchema, ['_id' as const]) {
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
  .set('toJSON', {
    virtuals: true,
    transform: (doc, converted) => {
      delete converted._id;
      delete converted.id;
    },
  })
;
