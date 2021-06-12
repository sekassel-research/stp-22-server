import { PickType } from '@nestjs/swagger';
import { Move } from './move.schema';

export class MoveDto extends PickType(Move, ['action'] as const) {
}
