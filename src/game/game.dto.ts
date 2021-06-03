import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
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
] as const) {
}

export class UpdateGameDto extends PickType(GameWithPassword, [
  'name',
  'owner',
  'password',
] as const) {
}
