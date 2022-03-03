import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Game } from '../../game/game.schema';
import { RESOURCE_TILE_TYPES, TileType, WEIGHTED_NUMBER_TOKENS } from '../shared/constants';
import { cubeCircle } from '../shared/hexagon';
import { randInt, shuffle } from '../shared/random';
import { Map, Tile } from './map.schema';

@Injectable()
export class MapService {
  constructor(
    @InjectModel('maps') private model: Model<Map>,
  ) {
  }

  async findByGame(gameId: string): Promise<Map | undefined> {
    return this.model.findOne({ gameId }).exec();
  }

  async createForGame(game: Game): Promise<Map> {
    const radius = game.settings?.mapRadius ?? 2;
    return this.model.create({
      gameId: game._id,
      tiles: this.generateTiles(radius),
    });
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
    return this.model.findOneAndDelete({ gameId }).exec();
  }
}
