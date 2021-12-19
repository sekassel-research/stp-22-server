import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsMongoId, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { Document } from 'mongoose';
import { GLOBAL_SCHEMA_OPTIONS, GlobalSchema, MONGO_ID_FORMAT } from '../util/schema';

@Schema(GLOBAL_SCHEMA_OPTIONS)
export class Game extends GlobalSchema {
  @Prop({ index: 1 })
  @ApiProperty()
  @IsNotEmpty()
  name: string;

  @Prop()
  @ApiProperty(MONGO_ID_FORMAT)
  @IsMongoId()
  owner: string;

  @Prop({ default: 0 })
  @ApiProperty()
  @IsNumber()
  members: number;

  @Prop()
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  started?: boolean;

  @Prop({
    transform: () => undefined,
  })
  passwordHash: string;
}

export type GameDocument = Game & Document;

export const GameSchema = SchemaFactory.createForClass(Game);
