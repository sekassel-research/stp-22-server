import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateMoveDto } from '../move.dto';
import { Move } from '../move.schema';
import { MoveService } from '../move.service';

@Injectable()
export class TradeService {
  constructor(
    private moveService: MoveService,
  ) {
  }

  async trade(gameId: string, userId: string, move: CreateMoveDto): Promise<Move> {
    if (!move.trade) {
      throw new BadRequestException('Missing trade property');
    }

    return this.moveService.create({
      ...move,
      building: undefined,
      gameId,
      userId,
    });
  }
}
