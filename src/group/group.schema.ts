import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';
import { Document } from 'mongoose';
import { GLOBAL_SCHEMA_OPTIONS, GlobalSchema } from '../util/schema';

@Schema(GLOBAL_SCHEMA_OPTIONS)
export class Group extends GlobalSchema {
  @Prop()
  @IsUUID(undefined, { each: true })
  @ApiProperty({ type: [String], format: 'uuid' })
  members: string[];
}

export type GroupDocument = Group & Document;

export const GroupSchema = SchemaFactory.createForClass(Group);
