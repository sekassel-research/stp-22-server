import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ArrayMaxSize, ArrayMinSize, IsMongoId, IsOptional, IsString, Length } from 'class-validator';
import { Document, Types } from 'mongoose';
import { GLOBAL_SCHEMA_OPTIONS, GlobalSchema, MONGO_ID_ARRAY_FORMAT } from '../util/schema';

const MAX_MEMBERS = 100;

@Schema(GLOBAL_SCHEMA_OPTIONS)
export class Group extends GlobalSchema {
  @Prop()
  @ApiPropertyOptional({ minLength: 1, maxLength: 32 })
  @IsOptional()
  @IsString()
  @Length(1, 32)
  name?: string;

  @Prop()
  @IsMongoId({ each: true })
  @ApiProperty({ ...MONGO_ID_ARRAY_FORMAT, minItems: 1, maxItems: MAX_MEMBERS })
  @ArrayMinSize(1)
  @ArrayMaxSize(MAX_MEMBERS)
  members: string[];
}

export type GroupDocument = Group & Document<Types.ObjectId>;

export const GroupSchema = SchemaFactory.createForClass(Group);
