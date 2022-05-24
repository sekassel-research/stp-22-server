import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EventService } from '../../event/event.service';
import { Game } from '../../game/game.schema';
import { MemberService } from '../../member/member.service';
import { RESOURCE_TILE_TYPES, TileType, WEIGHTED_NUMBER_TOKENS } from '../shared/constants';
import { cubeCircle } from '../shared/hexagon';
import { randInt, shuffle } from '../shared/random';
import { Map, Tile } from './map.schema';

@Injectable()
export class MapService {
  constructor(
    @InjectModel('maps') private model: Model<Map>,
    private memberService: MemberService,
    private eventService: EventService,
  ) {
  }

  async findByGame(gameId: string): Promise<Map | undefined> {
    return this.model.findOne({ gameId }).exec();
  }

  async createForGame(game: Game): Promise<Map> {
    const radius = 2;
    const gameId = game._id.toString();
    const createdOrExisting = await this.model.findOneAndUpdate({
      gameId
    }, {
      $setOnInsert: {
        gameId,
        tiles: this.generateTiles(radius),
      },
    }, { upsert: true, new: true });
    // FIXME don't emit when the map already existed
    this.emit('created', createdOrExisting);
    return createdOrExisting;
  }

  private generateTiles(radius: number): Tile[] {
    const totalTiles = 1 + 3 * radius * (radius + 1);
    const desertTiles = Math.floor(totalTiles / WEIGHTED_NUMBER_TOKENS.length);

    const tileTypes: TileType[] = [];
    while (tileTypes.length + desertTiles < totalTiles) {
      tileTypes.push(...RESOURCE_TILE_TYPES);
    }
    shuffle(tileTypes);

    const numberTokens: number[] = [];
    while (numberTokens.length + desertTiles < totalTiles) {
      numberTokens.push(...WEIGHTED_NUMBER_TOKENS);
    }
    shuffle(numberTokens);

    for (let i = 0; i < desertTiles; i++) {
      const desertIndex = randInt(totalTiles);
      tileTypes.splice(desertIndex, 0, 'desert');
      numberTokens.splice(desertIndex, 0, 7);
    }

    return cubeCircle(radius).map(({ x, y, z }, tileIndex) => ({
      x, y, z,
      type: tileTypes[tileIndex],
      numberToken: numberTokens[tileIndex],
    }));
  }

  async deleteByGame(gameId: string): Promise<Map | undefined> {
    const deleted = await this.model.findOneAndDelete({ gameId }).exec();
    deleted && this.emit('deleted', deleted);
    return deleted;
  }

  private emit(event: string, map: Map) {
    this.memberService.findAll(map.gameId).then(members => {
      this.eventService.emit(`games.${map.gameId}.state.${event}`, map, members.map(m => m.userId));
    });
  }
}
