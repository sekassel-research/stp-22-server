import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsByteLength, IsDate, IsMongoId, IsNumber, IsOptional, IsString } from 'class-validator';
import { Document } from 'mongoose';
import { GLOBAL_SCHEMA_WITHOUT_ID_OPTIONS, GlobalSchemaWithoutID, MONGO_ID_FORMAT } from '../util/schema';

const MAX_ID_LENGTH = 32;

@Schema({
  ...GLOBAL_SCHEMA_WITHOUT_ID_OPTIONS,
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      delete ret._id;
    },
  },
})
export class Achievement extends GlobalSchemaWithoutID {
  @Prop()
  @ApiProperty(MONGO_ID_FORMAT)
  @IsMongoId()
  userId: string;

  @Prop()
  @ApiProperty({ minLength: 1, maxLength: MAX_ID_LENGTH })
  @IsString()
  @IsByteLength(1, MAX_ID_LENGTH)
  id: string;

  @Prop({ type: Date, default: null })
  @ApiPropertyOptional({ type: Date, nullable: true })
  @Transform(({ value }) => value && new Date(value))
  @IsOptional()
  @IsDate()
  unlockedAt?: Date | null;

  @Prop()
  @ApiProperty()
  @IsNumber()
  progress: number;
}

export type AchievementDocument = Achievement & Document<never>;

export const AchievementSchema = SchemaFactory.createForClass(Achievement)
  .index({ userId: 1, id: 1 }, { unique: true })
;
