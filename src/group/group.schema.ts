import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId } from 'class-validator';
import { Document } from 'mongoose';
import { GLOBAL_SCHEMA_OPTIONS, GlobalSchema, MONGO_ID_FORMAT } from '../util/schema';

@Schema(GLOBAL_SCHEMA_OPTIONS)
export class Group extends GlobalSchema {
  @Prop()
  @IsMongoId({ each: true })
  @ApiProperty({ ...MONGO_ID_FORMAT, type: [String] })
  members: string[];
}

export type GroupDocument = Group & Document;

export const GroupSchema = SchemaFactory.createForClass(Group);
