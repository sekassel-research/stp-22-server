import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  IsByteLength,
  IsIn,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { Document, Types } from 'mongoose';
import { GLOBAL_SCHEMA_OPTIONS, GlobalSchema, MONGO_ID_ARRAY_FORMAT } from '../util/schema';
import { IsUrlOrUri } from '../util/url-or-uri.validator';

const MAX_AVATAR_LENGTH = 16 * 1024;
const MAX_FRIENDS = 100;

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
  @IsUrlOrUri()
  @IsByteLength(0, MAX_AVATAR_LENGTH)
  @ApiProperty({ format: 'url', required: false, maxLength: MAX_AVATAR_LENGTH })
  avatar?: string;

  @Prop({default: []})
  @ApiProperty({ ...MONGO_ID_ARRAY_FORMAT, maxItems: MAX_FRIENDS })
  @IsMongoId({each: true})
  @ArrayMaxSize(MAX_FRIENDS)
  friends: string[];

  @Prop({ transform: () => undefined })
  passwordHash?: string;

  @Prop({ transform: () => undefined })
  refreshKey?: string | null;
}

export type UserDocument = User & Document<Types.ObjectId>;

export const UserSchema = SchemaFactory.createForClass(User);
