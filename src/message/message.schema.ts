import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { Document } from 'mongoose';

@Schema({
  timestamps: true,
  versionKey: false,
})
export class Message {
  @ApiProperty({ format: 'objectid', example: '507f191e810c19729de860ea' })
  _id!: string;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

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
