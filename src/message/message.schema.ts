import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Message {
  @Prop()
  sender: string;

  @Prop()
  receiver: string; // channel or user

  @Prop()
  body: string;

  @Prop({ type: Date })
  timestamp: Date;
}

export type MessageDocument = Message & Document;

export const MessageSchema = SchemaFactory.createForClass(Message);
