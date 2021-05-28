import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';
import { Document } from 'mongoose';

@Schema({
  timestamps: true,
  versionKey: false,
})
export class Message {
  @ApiProperty()
  _id!: string;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  @Prop()
  @IsMongoId()
  @ApiProperty()
  sender: string;

  @Prop()
  @IsMongoId()
  @ApiProperty()
  receiver: string; // channel or user

  @Prop()
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  body: string;
}

export type MessageDocument = Message & Document;

export const MessageSchema = SchemaFactory.createForClass(Message);
