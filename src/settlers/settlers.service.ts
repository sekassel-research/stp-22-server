import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Game } from '../game/game.schema';
import { cubeCircle } from './hexagon';
import { RESOURCE_TILE_TYPES, TileType, WEIGHTED_NUMBER_TOKENS } from './settlers.constants';
import { Map, Tile } from './settlers.schema';

function randInt(maxExclusive: number): number {
  return Math.floor(Math.random() * maxExclusive);
}

function shuffle(a) { // fisher-yates shuffle
  for (let i = a.length - 1; i > 0; i--) {
    const j = randInt(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

@Injectable()
export class SettlersService {
  constructor(
    @InjectModel('maps') private model: Model<Map>,
  ) {
  }

  async findGameMap(gameId: string): Promise<Map | undefined> {
    return this.model.findOne({ gameId }).exec();
  }

  async createGameMap(game: Game): Promise<Map> {
    const radius = 2;
    const tiles = this.generateTiles(radius);

    const map: Map = {
      gameId: game._id,
      tiles,
    };
    return this.model.create(map);
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

  async deleteGameMap(gameId: string): Promise<Map | undefined> {
    return this.model.findOneAndDelete({ gameId }).exec();
  }
}
