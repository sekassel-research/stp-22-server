import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { Document } from 'mongoose';
import { GLOBAL_SCHEMA_OPTIONS, GlobalSchema } from '../util/schema';

@Schema(GLOBAL_SCHEMA_OPTIONS)
export class Message extends GlobalSchema {
  @Prop()
  @IsUUID()
  @ApiProperty({ format: 'uuid' })
  sender: string;

  @Prop()
  @IsUUID()
  @ApiProperty({ format: 'uuid' })
  receiver: string;

  @Prop()
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  body: string;
}

export type MessageDocument = Message & Document;

export const MessageSchema = SchemaFactory.createForClass(Message);
