import { Injectable } from '@nestjs/common';
import { CreateMoveDto } from '../move.dto';
import { Move } from '../move.schema';
import { MoveService } from '../move.service';

@Injectable()
export class DevelopmentService {
  constructor(
    private moveService: MoveService,
  ) {
  }

  async develop(gameId: string, userId: string, move: CreateMoveDto): Promise<Move> {
    const {action, developmentCard} = move;
    return this.moveService.create({
      gameId,
      userId,
      action,
      developmentCard,
    });
  }
}
