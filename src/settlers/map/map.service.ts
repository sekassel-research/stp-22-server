import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EventService } from '../../event/event.service';
import { Game } from '../../game/game.schema';
import { MemberService } from '../../member/member.service';
import { HarborTemplate, MapTemplate, TileTemplate } from '../map-template/map-template.schema';
import { MapTemplateService } from '../map-template/map-template.service';
import {
  RESOURCE_TILE_TYPES,
  RESOURCE_TYPES,
  ResourceType,
  TileType,
  WEIGHTED_NUMBER_TOKENS,
} from '../shared/constants';
import { Cube, cubeCircle, cubeRing } from '../shared/hexagon';
import { Harbor, Map, Tile } from './map.schema';

@Injectable()
export class MapService {
  constructor(
    @InjectModel('maps') private model: Model<Map>,
    private memberService: MemberService,
    private eventService: EventService,
    private mapTemplateService: MapTemplateService,
  ) {
  }

  async findByGame(gameId: string): Promise<Map | null> {
    return this.model.findOne({ gameId }).exec();
  }

  async createForGame(game: Game): Promise<Map | undefined> {
    const gameId = game._id;
    let tiles: Tile[];
    let harbors: Harbor[];

    const mapTemplate = game.settings?.mapTemplate;
    let template: MapTemplate | null;
    if (mapTemplate && (template = await this.mapTemplateService.find(mapTemplate))) {
      tiles = this.completeTiles(template.tiles);
      harbors = this.completeHarbors(template.harbors);
    } else {
      const radius = game.settings?.mapRadius ?? 2;
      tiles = this.generateTiles(radius);
      harbors = this.generateHarbors(radius);
    }

    try {
      const created = await this.model.create({
        gameId,
        tiles,
        harbors,
      });
      this.emit('created', created);
      return created;
    } catch (err: any) {
      if (err.code === 11000) { // map already exists
        return;
      }
      throw err;
    }
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
    tileTypes.shuffle();

    const numberTokens: number[] = [];
    while (numberTokens.length + desertTiles < totalTiles) {
      numberTokens.push(...WEIGHTED_NUMBER_TOKENS);
    }
    numberTokens.shuffle();

    for (let i = 0; i < desertTiles; i++) {
      const desertIndex = Math.randInt(totalTiles);
      tileTypes.splice(desertIndex, 0, 'desert');
      numberTokens.splice(desertIndex, 0, 7);
    }
    return tiles.map((t, i) => ({
      ...t,
      type: t.type || tileTypes[i],
      numberToken: t.numberToken || numberTokens[i],
    }));
  }

  private completeHarbors(harbors: HarborTemplate[]): Harbor[] {
    const resourcesCount = harbors.filter(h => h.type === 'random').length;
    const resourcesPool: ResourceType[] = [];
    while (resourcesPool.length < resourcesCount) {
      resourcesPool.push(...RESOURCE_TYPES);
      resourcesPool.push(...Array(RESOURCE_TYPES.length));
    }
    resourcesPool.shuffle();

    return harbors.map(h => ({
      ...h,
      type: h.type !== 'random' ? h.type : resourcesPool.pop(),
    }));
  }

  private generateHarbors(radius: number): Harbor[] {
    const tiles = 6 * radius; // (12)
    const harbors = tiles * 3/4; // (9)
    const resourcesCount = Math.ceil(harbors / 2); // (5)
    const resourcesPool: ResourceType[] = [];
    while (resourcesPool.length < resourcesCount) {
      resourcesPool.push(...RESOURCE_TYPES);
    }
    resourcesPool.shuffle();

    return cubeRing(Cube(0, 0, 0), radius)
      .filter((p, i) => i % 4 !== 0)
      .map((pos, i) => {
      if (i % 2 !== 0) {
        return pos;
      }
      return { ...pos, type: resourcesPool[i / 2] };
    });
  }

  async deleteByGame(gameId: string): Promise<Map | null> {
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
