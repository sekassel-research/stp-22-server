import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';
import { Game } from './game.schema';

export class CreateGameDto extends PickType(Game, [
  'name',
] as const) {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class UpdateGameDto extends PickType(CreateGameDto, [
  'name',
  'password',
] as const) {
  @ApiProperty()
  @IsMongoId()
  owner: string;
}
