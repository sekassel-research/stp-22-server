import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';
import { Document } from 'mongoose';

@Schema()
export class Message {
  @Prop()
  @IsMongoId()
  sender: string;

  @Prop()
  @IsMongoId()
  receiver: string; // channel or user

  @Prop()
  @IsString()
  @IsNotEmpty()
  body: string;

  @Prop({ type: Date })
  timestamp: Date;
}

export type MessageDocument = Message & Document;

export const MessageSchema = SchemaFactory.createForClass(Message);
