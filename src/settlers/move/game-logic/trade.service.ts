import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { FilterQuery, UpdateQuery } from 'mongoose';
import { BuildingDocument } from '../../building/building.schema';
import { BuildingService } from '../../building/building.service';
import { MapService } from '../../map/map.service';
import { Player, ResourceCount } from '../../player/player.schema';
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
    if (!move.resources) {
      throw new BadRequestException('Missing resources property');
    }

    const requests = Object.entries(move.resources).filter(([, count]) => count > 0);
    if (requests.length !== 1) {
      throw new ForbiddenException('Bank trades need to request exactly one type of resource');
    }
    const [requestResource, requestCount] = requests[0];
    if (requestCount !== 1) {
      throw new ForbiddenException('Bank trades need to request exactly one resource');
    }

    const offers = Object.entries(move.resources).filter(([, count]) => count < 0);
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
    if (!map) {
      throw new NotFoundException(gameId);
    }

    const harbors = map.harbors.filter(h => h.type === type);
    const $or: Point3DWithCornerSide[] = [];
    for (const harbor of harbors) {
      $or.push(...edgeAdjacentCorners(normalizeEdge(harbor, harbor.side)));
    }
    return this.buildingService.findAll(gameId, {
      owner: userId,
      $or,
    });
  }

  private async startOffer(gameId: string, userId: string, move: CreateMoveDto) {
    await this.createOffer(gameId, userId, move.resources!);
  }

  async offer(gameId: string, userId: string, move: CreateMoveDto): Promise<Move> {
    await this.createOffer(gameId, userId, move.resources!);
    return this.createMove(gameId, userId, move);
  }

  private async createOffer(gameId: string, userId: string, trade: ResourceCount) {
    await this.playerService.update(gameId, userId, {
      previousTradeOffer: trade,
    });
  }

  async accept(gameId: string, userId: string, move: CreateMoveDto): Promise<Move> {
    if (!move.partner) {
      return this.createMove(gameId, userId, move);
    }

    const otherPlayer = await this.playerService.findOne(gameId, move.partner);
    if (!otherPlayer) {
      throw new BadRequestException('The player does not exist!');
    }

    const { previousTradeOffer } = otherPlayer;
    if (!previousTradeOffer) {
      throw new BadRequestException('The player did not offer trade!');
    }

    for (const [resource, count] of Object.entries(previousTradeOffer)) {
      if (count < 0 && (otherPlayer.resources[resource as ResourceType] || 0) < -count) {
        throw new BadRequestException('The player can no longer afford the trade');
      }
    }

    // TODO transaction?
    const filter: FilterQuery<Player> = {};
    const update: UpdateQuery<Player> & { $inc: any; } = { $inc: {} };
    const updateOther: UpdateQuery<Player> & { $inc: any; } = { $inc: {} };
    for (const [resource, count] of Object.entries(previousTradeOffer)) {
      count > 0 && (filter['resources.' + resource] = { $gte: count });
      update.$inc['resources.' + resource] = -count;
      updateOther.$inc['resources.' + resource] = count;
    }

    const currentPlayer = await this.playerService.update(gameId, userId, update, filter);
    if (!currentPlayer) {
      throw new BadRequestException('You cannot afford that!');
    }

    // the other player definitely has the resources - it was checked above
    // and there is no way for them to gain or spend any in the meantime.
    await this.playerService.update(gameId, otherPlayer.userId, updateOther);

    return this.createMove(gameId, userId, move);
  }
}
