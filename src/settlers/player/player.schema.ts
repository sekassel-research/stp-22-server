import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { IsHexColor, IsMongoId } from 'class-validator';
import { GLOBAL_SCHEMA_WITHOUT_ID_OPTIONS, MONGO_ID_FORMAT } from '../../util/schema';
import { RESOURCE_TYPES, ResourceType } from '../shared/constants';

export type ResourceCount = Partial<Record<'unknown' | ResourceType, number>>;

@Schema({ ...GLOBAL_SCHEMA_WITHOUT_ID_OPTIONS, timestamps: false })
export class Player {
  @Prop()
  @ApiProperty(MONGO_ID_FORMAT)
  @IsMongoId()
  gameId: string;

  @Prop()
  @ApiProperty(MONGO_ID_FORMAT)
  @IsMongoId()
  userId: string;

  @Prop()
  @ApiProperty({ format: 'hex-color', example: '#0075ff' })
  @IsHexColor()
  color: string;

  @Prop({ type: Object })
  @ApiProperty({
    type: 'object',
    properties: Object.assign({ unknown: { type: 'integer', required: false } }, ...RESOURCE_TYPES.map(rt => ({ [rt]: { type: 'integer', required: false } }))),
  })
  resources: ResourceCount;
}

export const PlayerSchema = SchemaFactory.createForClass(Player)
  .index({ gameId: 1, userId: 1 }, { unique: true })
;
