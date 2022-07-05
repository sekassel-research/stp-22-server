import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateQuery } from 'mongoose';
import { DevelopmentCard, Player } from '../../player/player.schema';
import { PlayerService } from '../../player/player.service';
import { DEVELOPMENT_COST, DEVELOPMENT_WEIGHT, DevelopmentType, ResourceType } from '../../shared/constants';
import { CreateMoveDto } from '../move.dto';
import { Move } from '../move.schema';
import { MoveService } from '../move.service';
import { BuildService } from './build.service';

@Injectable()
export class DevelopmentService {
  constructor(
    private moveService: MoveService,
    private playerService: PlayerService,
    private buildService: BuildService,
  ) {
  }

  async develop(gameId: string, userId: string, move: CreateMoveDto): Promise<Move> {
    const { action, developmentCard } = move;
    switch (developmentCard) {
      case undefined:
        throw new BadRequestException();
      case 'new':
        await this.buy(gameId, userId);
        break;
      case 'victory-point':
        throw new ConflictException('You can\'t reveal your victory points!');
      default:
        await this.reveal(gameId, userId, developmentCard);
        break;
    }

    return this.moveService.create({
      gameId,
      userId,
      action,
      developmentCard,
    });
  }

  private async buy(gameId: string, userId: string) {
    const players = await this.playerService.findAll(gameId);
    const currentPlayer = players.find(p => p.userId === userId);
    if (!currentPlayer) {
      throw new NotFoundException(userId);
    }

    await this.buildService.checkResourceCosts(DEVELOPMENT_COST, currentPlayer);

    const type = await this.randomDevelopmentType(players);
    const update: UpdateQuery<Player> = {
      $push: {
        developmentCards: {
          type,
          revealed: false,
          locked: true,
        },
      },
      $inc: {},
    };
    if (type === 'victory-point') {
      update.$inc!.victoryPoints = 1;
    }
    this.buildService.deductCosts(DEVELOPMENT_COST, update.$inc!);
    await this.playerService.update(gameId, userId, update);
  }

  private async randomDevelopmentType(players: Player[]): Promise<DevelopmentType> {
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
    for (const [type, weight] of Object.entries(weights)) {
      if (rand < weight) {
        return type as DevelopmentType;
      }
      rand -= weight;
    }
    throw new ConflictException('No development cards available');
  }

  private async reveal(gameId: string, userId: string, developmentCard: DevelopmentType) {
    const player = await this.playerService.findOne(gameId, userId);
    if (!player) {
      throw new NotFoundException(userId);
    }

    const developmentCards = player.developmentCards ?? [];
    const index = developmentCards.findIndex(c => c.type === developmentCard && !c.revealed && !c.locked);
    if (index < 0) {
      throw new NotFoundException(`You do not own an unrevealed unlocked ${developmentCard}!`);
    }

    const update: UpdateQuery<Player> = {
      [`developmentCards.${index}.revealed`]: true,
    };
    if (developmentCard === 'knight') {
      const knights = this.countKnights(developmentCards) + 1;
      if (knights >= 3) {
        const otherPlayers = await this.playerService.findAll(gameId, {
          userId: { $ne: userId },
        });
        const bestOtherPlayer = otherPlayers.maxBy(p => this.countKnights(p.developmentCards));
        const otherKnights = this.countKnights(bestOtherPlayer?.developmentCards);
        if (!bestOtherPlayer || knights > otherKnights) {
          update.$inc = {victoryPoints: +2};
        }
        if (bestOtherPlayer && knights >= otherKnights) {
          await this.playerService.update(gameId, bestOtherPlayer.userId, {
            $inc: { victoryPoints: -2 },
          });
        }
      }
    }
    await this.playerService.update(gameId, userId, update);
  }

  private countKnights(developmentCards?: DevelopmentCard[]) {
    return developmentCards ? developmentCards.filter(c => c.type === 'knight' && c.revealed).length : 0;
  }

  async monopoly(gameId: string, userId: string, move: CreateMoveDto) {
    if (!move.resources) {
      throw new BadRequestException('Missing resource property');
    }

    const resources = Object.keys(move.resources);
    if (resources.length !== 1) {
      throw new ForbiddenException('Only one resource can be selected for monopoly');
    }

    const resource = resources[0] as ResourceType;
    const players = await this.playerService.findAll(gameId, {
      [`resources.${resource}`]: { $gt: 0 },
      userId: { $ne: userId },
    });
    const totalGained = players.map(p => p.resources[resource] ?? 0).sum();

    await Promise.all([
      this.playerService.update(gameId, userId, {
        $inc: {
          [`resources.${resource}`]: totalGained,
        },
      }),
      ...players.map(p => this.playerService.update(gameId, p.userId, {
        ['resources.' + resource]: 0,
      })),
    ]);

    return this.moveService.create({
      gameId,
      userId,
      action: 'monopoly',
      resources: move.resources,
    });
  }

  async yearOfPlenty(gameId: string, userId: string, move: CreateMoveDto) {
    if (!move.resources) {
      throw new BadRequestException('Missing resources property');
    }

    const sum = Object.values(move.resources).sum();
    if (sum !== 2) {
      throw new ForbiddenException('A total of two resources must be selected for year of plenty');
    }

    await this.playerService.update(gameId, userId, {
      $inc: Object.fromEntries(Object.entries(move.resources).map(([resource, amount]) => [`resources.${resource}`, amount])),
    });

    return this.moveService.create({
      gameId,
      userId,
      action: 'year-of-plenty',
      resources: move.resources,
    });
  }
}
