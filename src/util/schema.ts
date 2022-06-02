import { SchemaOptions } from '@nestjs/mongoose';
import { ApiProperty, ApiPropertyOptions } from '@nestjs/swagger';
import { Types } from 'mongoose';


export const GLOBAL_SCHEMA_OPTIONS: SchemaOptions = {
  timestamps: true,
  versionKey: false,
};

export const GLOBAL_SCHEMA_WITHOUT_ID_OPTIONS: SchemaOptions = {
  ...GLOBAL_SCHEMA_OPTIONS,
  id: false,
  toJSON: {
    virtuals: true,
    transform: (doc, converted) => {
      delete converted._id;
      delete converted.id;
    },
  },
};

export const MONGO_ID_FORMAT: ApiPropertyOptions = {
  type: String,
  format: 'objectid',
  example: '507f191e810c19729de860ea',
};

export const MONGO_ID_ARRAY_FORMAT: ApiPropertyOptions = {
  format: MONGO_ID_FORMAT.format,
  example: [MONGO_ID_FORMAT.example],
  type: [String],
};

export class GlobalSchemaWithoutID {
  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

export class GlobalSchema extends GlobalSchemaWithoutID {
  @ApiProperty(MONGO_ID_FORMAT)
  _id!: Types.ObjectId;
}
