import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty, OmitType } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { Document } from 'mongoose';
import { GLOBAL_SCHEMA_OPTIONS, GlobalSchema } from '../util/schema';

@Schema({ ...GLOBAL_SCHEMA_OPTIONS, timestamps: false })
export class User extends OmitType(GlobalSchema, ['createdAt', 'updatedAt']) {
  @Prop({ index: { type: 1, unique: true } })
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  name: string;

  @Prop({ transform: () => undefined })
  passwordSalt?: string;

  @Prop({ transform: () => undefined })
  passwordHash?: string;
}

export type UserDocument = User & Document;

export const UserSchema = SchemaFactory.createForClass(User);
