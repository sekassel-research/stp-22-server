import { ApiProperty, ApiPropertyOptions } from '@nestjs/swagger';

export const GLOBAL_SCHEMA_OPTIONS = {
  timestamps: true,
  versionKey: false,
};

export const MONGO_ID_FORMAT: ApiPropertyOptions = {
  format: 'objectid',
  example: '507f191e810c19729de860ea',
};

export class GlobalSchema {
  @ApiProperty(MONGO_ID_FORMAT)
  _id!: string;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
