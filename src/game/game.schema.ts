import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsUUID } from 'class-validator';
import { Document } from 'mongoose';
import { GLOBAL_SCHEMA_OPTIONS, GlobalSchema } from '../util/schema';

@Schema(GLOBAL_SCHEMA_OPTIONS)
export class Game extends GlobalSchema {
  @Prop({ index: 1 })
  @ApiProperty()
  @IsNotEmpty()
  name: string;

  @Prop()
  @ApiProperty()
  @IsUUID()
  owner: string;

  @Prop({ default: 0 })
  @ApiProperty()
  @IsNumber()
  members: number;

  @Prop({
    transform: () => undefined,
  })
  passwordSalt: string;

  @Prop({
    transform: () => undefined,
  })
  passwordHash: string;
}

export type GameDocument = Game & Document;

export const GameSchema = SchemaFactory.createForClass(Game);
