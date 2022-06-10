import { PartialType, PickType } from '@nestjs/swagger';
import { Player } from './player.schema';

export class UpdatePlayerDto extends PartialType(PickType(Player, [
  'active',
])) {
}
