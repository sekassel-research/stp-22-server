import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { StateService } from 'src/settlers/state/state.service';
import { isDeepStrictEqual } from 'util';
import { BuildingDocument } from '../../building/building.schema';
import { BuildingService } from '../../building/building.service';
import { MapService } from '../../map/map.service';
import { ResourceCount } from '../../player/player.schema';
import { PlayerService } from '../../player/player.service';
import { ResourceType } from '../../shared/constants';
import { edgeAdjacentCorners, normalizeEdge, Point3DWithCornerSide } from '../../shared/hexagon';
import { ExpectedMove } from '../../state/state.schema';
import { CreateMoveDto } from '../move.dto';
import { BANK_TRADE_ID, Move } from '../move.schema';
import { MoveService } from '../move.service';
import { StateTransitionService } from './state-transition.service';

@Injectable()
export class TradeService {
  constructor(
    private moveService: MoveService,
    private mapService: MapService,
    private buildingService: BuildingService,
    private playerService: PlayerService,
    private stateService: StateService,
    private stateTransitionService: StateTransitionService,
  ) {
  }

  async buildTrade(gameId: string, userId: string, move: CreateMoveDto): Promise<Move> {
    if (move.partner === BANK_TRADE_ID) {
      await this.bankTrade(gameId, userId, move);
    } else {
      await this.startOffer(gameId, userId, move);
    }
    return this.createMove(gameId, userId, move);
  }

  private createMove(gameId: string, userId: string, move: CreateMoveDto) {
    return this.moveService.create({
      ...move,
      building: undefined,
      gameId,
      userId,
    });
  }

  async bankTrade(gameId: string, userId: string, move: CreateMoveDto) {
    if (!move.trade) {
      throw new BadRequestException('Missing trade property');
    }

    const requests = Object.entries(move.trade).filter(([, count]) => count > 0);
    if (requests.length !== 1) {
      throw new ForbiddenException('Bank trades need to request exactly one type of resource');
    }
    const [requestResource, requestCount] = requests[0];
    if (requestCount !== 1) {
      throw new ForbiddenException('Bank trades need to request exactly one resource');
    }

    const offers = Object.entries(move.trade).filter(([, count]) => count < 0);
    if (offers.length !== 1) {
      throw new ForbiddenException('Bank trades need to offer exactly one type of resource');
    }
    const [offerResource, offerCount] = offers[0];
    switch (offerCount) {
      case -4:
        break; // always allow 4-1 trades
      case -3: {
        const buildings = await this.findBuildingsNearHarbors(gameId, userId, undefined);
        if (!buildings.length) {
          throw new ForbiddenException('No building near 3-1 harbor');
        }
        break;
      }
      case -2: {
        const buildings = await this.findBuildingsNearHarbors(gameId, userId, offerResource as ResourceType);
        if (!buildings.length) {
          throw new ForbiddenException(`No building near 2-1 ${offerResource} harbor`);
        }
        break;
      }
      default:
        throw new ForbiddenException('Bank trades need to offer 2, 3, or 4 resources');
    }

    const player = await this.playerService.update(gameId, userId, {
      $inc: {
        ['resources.' + requestResource]: requestCount,
        ['resources.' + offerResource]: offerCount,
      },
    }, {
      ['resources.' + offerResource]: { $gte: -offerCount },
    });
    if (!player) {
      throw new ForbiddenException('You can\'t afford that!');
    }
  }

  private async findBuildingsNearHarbors(gameId: string, userId: string, type: ResourceType | undefined): Promise<BuildingDocument[]> {
    const map = await this.mapService.findByGame(gameId);
    const harbors = map.harbors.filter(h => h.type === type);
    const $or: Point3DWithCornerSide[] = [];
    for (const harbor of harbors) {
      $or.push(...edgeAdjacentCorners(normalizeEdge(harbor, harbor.side)));
    }
    return this.buildingService.findAll({
      gameId,
      owner: userId,
      $or,
    });
  }

  private async startOffer(gameId: string, userId: string, move: CreateMoveDto) {
    await this.createOffer(gameId, userId, move.trade);

    const players = await this.playerService.findAll(gameId);
    const others = players.filter(p => p.userId !== userId);
    const othersOffer: ExpectedMove = {
      action: 'offer',
      players: others.map(o => o.userId),
    };
    const playerAccepts: ExpectedMove = {
      action: 'accept',
      players: [userId],
    };
    await this.stateService.update(gameId, {
      $push: {
        expectedMoves: {
          $position: 0,
          $each: [
            othersOffer,
            playerAccepts,
          ],
        },
      },
    });
  }

  async offer(gameId: string, userId: string, move: CreateMoveDto): Promise<Move> {
    await this.createOffer(gameId, userId, move.trade);
    await this.stateTransitionService.advanceSimple(gameId, userId);
    return this.createMove(gameId, userId, move);
  }

  private async createOffer(gameId: string, userId: string, trade: ResourceCount) {
    await this.playerService.update(gameId, userId, {
      previousTradeOffer: trade,
    });
  }

  async accept(gameId: string, userId: string, move: CreateMoveDto): Promise<Move> {
    const otherPlayer = await this.playerService.findOne(gameId, move.partner);
    if (!otherPlayer) {
      throw new BadRequestException('The player does not exist!');
    }

    const { previousTradeOffer } = otherPlayer;
    if (!previousTradeOffer) {
      throw new BadRequestException('The player did not offer trade!');
    }
    const negOffer: ResourceCount = {};
    for (const [resource, count] of Object.entries(previousTradeOffer)) {
      negOffer[resource] = -count;
    }

    if (!isDeepStrictEqual(move.trade, negOffer)) {
      throw new BadRequestException('Offers do not match!');
    }
    for (const [resource, count] of Object.entries(previousTradeOffer)) {
      if ((otherPlayer.resources[resource] || 0) < count) {
        throw new BadRequestException('The player can no longer afford the trade');
      }
    }

    // TODO transaction?
    const resourceFilter = Object.entries(move.trade).reduce((a, [resource, count]) => {
      count < 0 && (a[resource] = { $gte: -count });
      return a;
    }, {});
    await this.playerService.update(gameId, userId, {
      $inc: { resources: move.trade },
    }, {
      resources: resourceFilter,
    });

    // the other player definitely has the resources - it was checked above
    // and there is no way for them to gain or spend any in the meantime.
    await this.playerService.update(gameId, otherPlayer.userId, {
      $inc: { resources: previousTradeOffer },
    });

    await this.stateTransitionService.advanceSimple(gameId, userId);
    return this.createMove(gameId, userId, move);
  }
}
