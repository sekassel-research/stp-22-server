import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
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
  @IsUUID()
  owner: string;
}
