import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { Document } from 'mongoose';
import { GLOBAL_SCHEMA_OPTIONS, GlobalSchema } from '../util/schema';

@Schema(GLOBAL_SCHEMA_OPTIONS)
export class Message extends GlobalSchema {
  @Prop({ transform: () => undefined })
  @IsString()
  @IsNotEmpty()
  namespace: string;

  @Prop({ transform: () => undefined })
  @IsMongoId()
  parent: string;

  @Prop()
  @IsUUID()
  @ApiProperty({ format: 'uuid' })
  sender: string;

  @Prop()
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  body: string;
}

export type MessageDocument = Message & Document;

export const MessageSchema = SchemaFactory.createForClass(Message)
  .index({ namespace: 1, parent: 1 });
