import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { BuildingDocument } from '../../building/building.schema';
import { BuildingService } from '../../building/building.service';
import { MapService } from '../../map/map.service';
import { PlayerService } from '../../player/player.service';
import { ResourceType } from '../../shared/constants';
import { edgeAdjacentCorners, normalizeEdge, Point3DWithCornerSide } from '../../shared/hexagon';
import { CreateMoveDto } from '../move.dto';
import { BANK_TRADE_ID, Move } from '../move.schema';
import { MoveService } from '../move.service';

@Injectable()
export class TradeService {
  constructor(
    private moveService: MoveService,
    private mapService: MapService,
    private buildingService: BuildingService,
    private playerService: PlayerService,
  ) {
  }

  async trade(gameId: string, userId: string, move: CreateMoveDto): Promise<Move> {
    if (!move.trade) {
      throw new BadRequestException('Missing trade property');
    }

    if (move.trade.partner === BANK_TRADE_ID) {
      await this.bankTrade(gameId, userId, move);
    }

    return this.moveService.create({
      ...move,
      building: undefined,
      gameId,
      userId,
    });
  }

  private async bankTrade(gameId: string, userId: string, move: CreateMoveDto) {
    const requests = Object.entries(move.trade.request);
    if (requests.length !== 1) {
      throw new ForbiddenException('Bank trades need to request exactly one type of resource');
    }
    const [requestResource, requestCount] = requests[0];
    if (requestCount !== 1) {
      throw new ForbiddenException('Bank trades need to request exactly one resource');
    }

    const offers = Object.entries(move.trade.offer);
    if (offers.length !== 1) {
      throw new ForbiddenException('Bank trades need to offer exactly one type of resource');
    }
    const [offerResource, offerCount] = offers[0];
    switch (offerCount) {
      case 4:
        break; // always allow 4-1 trades
      case 3: {
        const buildings = await this.findBuildingsNearHarbors(gameId, userId, undefined);
        if (!buildings.length) {
          throw new ForbiddenException('No building near 3-1 harbor');
        }
        break;
      }
      case 2: {
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
        ['resources.' + offerResource]: -offerCount,
      },
    }, {
      ['resources.' + offerResource]: { $gte: offerCount },
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
}
