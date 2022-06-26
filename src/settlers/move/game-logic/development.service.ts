import { ConflictException, Injectable } from '@nestjs/common';
import { UpdateQuery } from 'mongoose';
import { Player } from '../../player/player.schema';
import { PlayerService } from '../../player/player.service';
import { DEVELOPMENT_WEIGHT, DevelopmentType } from '../../shared/constants';
import { CreateMoveDto } from '../move.dto';
import { Move } from '../move.schema';
import { MoveService } from '../move.service';

@Injectable()
export class DevelopmentService {
  constructor(
    private moveService: MoveService,
    private playerService: PlayerService,
  ) {
  }

  async develop(gameId: string, userId: string, move: CreateMoveDto): Promise<Move> {
    const { action, developmentCard } = move;
    switch (developmentCard) {
      case 'new':
        await this.buy(gameId, userId);
        break;
      case 'victory-point':
        throw new ConflictException('You can\'t reveal your victory points!');
    }

    return this.moveService.create({
      gameId,
      userId,
      action,
      developmentCard,
    });
  }

  private async buy(gameId: string, userId: string) {
    const type = await this.randomDevelopmentType(gameId);
    const update: UpdateQuery<Player> = {
      $push: {
        developmentCards: {
          type,
          revealed: false,
        },
      },
    };
    if (type === 'victory-point') {
      update.$inc = { victoryPoints: 1 };
    }
    await this.playerService.update(gameId, userId, update);
  }

  private async randomDevelopmentType(gameId: string): Promise<DevelopmentType> {
    const players = await this.playerService.findAll(gameId);
    const weights = { ...DEVELOPMENT_WEIGHT };
    for (const player of players) {
      for (const card of player.developmentCards ?? []) {
        if (card.type === 'unknown') {
          // not actually reachable, but required for type checking
          continue;
        }
        weights[card.type]--;
      }
    }

    const remaining = Object.values(weights).sum();
    let rand = Math.randInt(remaining);
    for (const [type, weight] of Object.entries(DEVELOPMENT_WEIGHT)) {
      if (rand < weight) {
        return type as DevelopmentType;
      }
      rand -= weight;
    }
    throw new ConflictException('No development cards available');
  }
}
