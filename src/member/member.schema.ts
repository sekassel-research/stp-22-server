import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { GLOBAL_SCHEMA_OPTIONS, GlobalSchema } from '../util/schema';

@Schema({
  ...GLOBAL_SCHEMA_OPTIONS,
  id: false,
})
export class Member extends GlobalSchema {
  @Prop()
  gameId: string;

  @Prop()
  userId: string;
}

export type MemberDocument = Member & Document;

export const MemberSchema = SchemaFactory.createForClass(Member)
  .index({ gameId: 1, userId: 1 }, { unique: true })
;
