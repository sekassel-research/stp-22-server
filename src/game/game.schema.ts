import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsMongoId, IsNotEmpty, IsNumber, IsOptional, MaxLength } from 'class-validator';
import { Document, Types } from 'mongoose';
import { GLOBAL_SCHEMA_OPTIONS, GlobalSchema, MONGO_ID_FORMAT } from '../util/schema';

@Schema(GLOBAL_SCHEMA_OPTIONS)
export class Game extends GlobalSchema {
  @Prop({ index: 1 })
  @ApiProperty({ minLength: 1, maxLength: 32 })
  @IsNotEmpty()
  @MaxLength(32)
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

export type GameDocument = Game & Document<Types.ObjectId>;

export const GameSchema = SchemaFactory.createForClass(Game);
