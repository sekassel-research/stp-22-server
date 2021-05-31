import { PickType } from '@nestjs/swagger';
import { Game } from './game.schema';

export class CreateGameDto extends PickType(Game, [
  'name',
] as const) {
}

export class UpdateGameDto extends PickType(Game, [
  'name',
] as const) {
}
