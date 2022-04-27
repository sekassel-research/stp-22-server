import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { IsByteLength, IsIn, IsNotEmpty, IsOptional, IsString, Matches, MaxLength } from 'class-validator';
import { Document } from 'mongoose';
import { GLOBAL_SCHEMA_OPTIONS, GlobalSchema } from '../util/schema';

const MAX_AVATAR_LENGTH = 16 * 1024;
export const STATUS = ['online', 'offline'] as const;
export type Status = typeof STATUS[number];

@Schema(GLOBAL_SCHEMA_OPTIONS)
export class User extends GlobalSchema {
  @Prop({ index: { type: 1, unique: true } })
  @ApiProperty({ minLength: 1, maxLength: 32 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(32)
  name: string;

  @Prop({ type: String })
  @IsIn(STATUS)
  @ApiProperty({ enum: STATUS })
  status: Status;

  @Prop()
  @IsOptional()
  @Matches(/^\w+:/, { message: 'avatar must be a valid URI' })
  @IsByteLength(0, MAX_AVATAR_LENGTH)
  @ApiProperty({ format: 'url', required: false, maxLength: MAX_AVATAR_LENGTH })
  avatar?: string;

  @Prop({ transform: () => undefined })
  passwordHash?: string;

  @Prop({ transform: () => undefined })
  refreshKey?: string;
}

export type UserDocument = User & Document;

export const UserSchema = SchemaFactory.createForClass(User);
