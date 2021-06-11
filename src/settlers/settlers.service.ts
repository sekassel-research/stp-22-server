import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Game } from '../game/game.schema';
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

    const tiles: Tile[] = [];

    const desertIndex = randInt(totalTiles);
    const tileTypes: TileType[] = [];
    while (tileTypes.length < totalTiles) {
      tileTypes.push(...RESOURCE_TILE_TYPES);
    }
    shuffle(tileTypes);
    tileTypes.splice(desertIndex, 0, 'desert');

    const numberTokens: number[] = [];
    while (numberTokens.length < totalTiles) {
      numberTokens.push(...WEIGHTED_NUMBER_TOKENS);
    }
    shuffle(numberTokens);
    numberTokens.splice(desertIndex, 0, 7);

    let tileIndex = 0;

    for (let x = -radius; x <= radius; x++) {
      for (let y = -radius; y <= radius; y++) {
        for (let z = -radius; z <= radius; z++) {
          if (x + y + z != 0) {
            continue;
          }

          tiles.push({
            x, y, z,
            type: tileTypes[tileIndex],
            numberToken: numberTokens[tileIndex],
          });

          tileIndex++;
        }
      }
    }
    return tiles;
  }

  async deleteGameMap(gameId: string): Promise<Map | undefined> {
    return this.model.findOneAndDelete({ gameId }).exec();
  }
}
