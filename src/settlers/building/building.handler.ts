import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Game } from '../../game/game.schema';
import { BuildingService } from './building.service';

@Injectable()
export class BuildingHandler {
  constructor(
    private buildingService: BuildingService,
  ) {
  }

  @OnEvent('games.*.deleted')
  async onGameDeleted(game: Game): Promise<void> {
    await this.buildingService.deleteByGame(game._id.toString());
  }
}
