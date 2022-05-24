import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';
import { Document, Types } from 'mongoose';
import { GLOBAL_SCHEMA_OPTIONS, MONGO_ID_FORMAT } from '../../util/schema';
import { BUILDING_TYPES, BuildingType } from '../shared/constants';
import { CORNER_SIDES, EDGE_SIDES, Side, SIDES } from '../shared/hexagon';
import { Point3D } from '../shared/schema';

@Schema({ ...GLOBAL_SCHEMA_OPTIONS, versionKey: false, timestamps: false })
export class Building extends Point3D {
  @ApiProperty(MONGO_ID_FORMAT)
  _id!: string;

  @Prop()
  @ApiProperty({
    type: 'integer',
    enum: SIDES,
    description: `
[Reference](https://www.redblobgames.com/grids/hexagons/#coordinates-cube)

${CORNER_SIDES.map(s => `- ${s} = Settlement/City at ${s} o'clock`).join('\n')}
${EDGE_SIDES.map(s => `- ${s} = Road at ${s} o'clock`).join('\n')}
`,
  })
  @IsIn(SIDES)
  side: Side;

  @Prop()
  @ApiProperty({ enum: BUILDING_TYPES })
  @IsIn(BUILDING_TYPES)
  type: BuildingType;

  @Prop()
  @ApiProperty(MONGO_ID_FORMAT)
  gameId: string;

  @Prop()
  @ApiProperty(MONGO_ID_FORMAT)
  owner: string;
}

export type BuildingDocument = Building & Document<Types.ObjectId>;

export const BuildingSchema = SchemaFactory.createForClass(Building)
  .index({ gameId: 1, x: 1, y: 1, z: 1, side: 1 }, { unique: true })
;
