import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { PartialType } from '../util/partial-type';
import { Game } from './game.schema';

class GameWithPassword extends Game {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class CreateGameDto extends PickType(GameWithPassword, [
  'name',
  'password',
  'started',
] as const) {
}

export class UpdateGameDto extends PartialType(PickType(GameWithPassword, [
  'name',
  'owner',
  'password',
  'started',
] as const)) {
}
