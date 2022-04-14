import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Game } from '../../game/game.schema';
import { TileTemplate } from '../map-template/map-template.schema';
import { MapTemplateService } from '../map-template/map-template.service';
import {
  RESOURCE_TILE_TYPES,
  RESOURCE_TYPES,
  ResourceType,
  TileType,
  WEIGHTED_NUMBER_TOKENS,
} from '../shared/constants';
import { Cube, cubeCircle, cubeRing } from '../shared/hexagon';
import { randInt, shuffle } from '../shared/random';
import { Harbor, Map, Tile } from './map.schema';

@Injectable()
export class MapService {
  constructor(
    @InjectModel('maps') private model: Model<Map>,
    private mapTemplateService: MapTemplateService,
  ) {
  }

  async findByGame(gameId: string): Promise<Map | undefined> {
    return this.model.findOne({ gameId }).exec();
  }

  async createForGame(game: Game): Promise<Map> {
    const gameId = game._id;
    let tiles: Tile[];
    let harbors: Harbor[];

    const mapTemplate = game.settings?.mapTemplate;
    if (mapTemplate) {
      const template = await this.mapTemplateService.find(mapTemplate);
      if (template && template.harbors) {
        harbors = template.harbors;
      }
      if (template && template.tiles) {
        tiles = this.completeTiles(template.tiles);
      }
    }

    const radius = game.settings?.mapRadius ?? 2;
    tiles ||= this.generateTiles(radius);
    harbors ||= this.generateHarbors(radius);

    return this.model.findOneAndUpdate({ gameId }, {
      $setOnInsert: {
        gameId,
        tiles,
        harbors,
      },
    }, { upsert: true, new: true });
  }

  private generateTiles(radius: number): Tile[] {
    return this.completeTiles(cubeCircle(radius));
  }

  private completeTiles(tiles: TileTemplate[]): Tile[] {
    const totalTiles = tiles.length;
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
    return tiles.map((t, i) => ({
      ...t,
      type: t.type || tileTypes[i],
      numberToken: t.numberToken || numberTokens[i],
    }));
  }

  private generateHarbors(radius: number): Harbor[] {
    const resourcesCount = 3 * radius;
    const resourcesPool: ResourceType[] = [];
    while (resourcesPool.length < resourcesCount) {
      resourcesPool.push(...RESOURCE_TYPES);
    }
    shuffle(resourcesPool);

    return cubeRing(Cube(0, 0, 0), radius).map((pos, i) => {
      if (i % 2 !== 0) {
        return pos;
      }
      return { ...pos, type: resourcesPool[i / 2] };
    });
  }

  async deleteByGame(gameId: string): Promise<Map | undefined> {
    return this.model.findOneAndDelete({ gameId }).exec();
  }
}
