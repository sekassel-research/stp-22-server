import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';
import { MONGO_ID_FORMAT } from '../../util/schema';
import { BUILDING_TYPES, BuildingType } from '../shared/constants';
import { Point3D } from '../shared/schema';

@Schema()
export class Building extends Point3D {
  @Prop()
  @ApiProperty({
    type: 'integer', minimum: 0, maximum: 2, description: `
[Reference](https://www.redblobgames.com/grids/hexagons/#coordinates-cube)

For roads:
- 0 = Edge labeled x
- 1 = Edge labeled y
- 2 = Edge labeled z

For settlements and cities:
- 0 = Top vertex
- 1 = Bottom vertex
`,
  })
  side: number;

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

export const BuildingSchema = SchemaFactory.createForClass(Building)
  .index({ gameId: 1 }, { unique: true })
;
