import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty, OmitType } from '@nestjs/swagger';
import { IsBoolean, IsMongoId } from 'class-validator';
import { Document } from 'mongoose';
import { GLOBAL_SCHEMA_OPTIONS, GlobalSchema, MONGO_ID_FORMAT } from '../util/schema';

@Schema(GLOBAL_SCHEMA_OPTIONS)
export class Member extends OmitType(GlobalSchema, ['_id' as const]) {
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
