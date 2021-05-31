import { ApiProperty } from '@nestjs/swagger';

export const GLOBAL_SCHEMA_OPTIONS = {
  timestamps: true,
  versionKey: false,
}

export class GlobalSchema {
  @ApiProperty({ format: 'objectid', example: '507f191e810c19729de860ea' })
  _id!: string;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
