import { Prop, Schema } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

@Schema()
export class Point3D {
  @Prop()
  @ApiProperty()
  @IsInt()
  x: number;

  @Prop()
  @ApiProperty()
  @IsInt()
  y: number;

  @Prop()
  @ApiProperty()
  @IsInt()
  z: number;
}
