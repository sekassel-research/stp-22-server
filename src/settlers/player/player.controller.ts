import { Controller, Get, Param } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { NotFound } from '../../util/not-found.decorator';
import { Throttled } from '../../util/throttled.decorator';
import { Validated } from '../../util/validated.decorator';
import { Player } from './player.schema';
import { PlayerService } from './player.service';

@Controller('games/:gameId/players')
@ApiTags('Settlers of Catan')
@Validated()
@Throttled()
export class PlayerController {
  constructor(
    private playerService: PlayerService,
  ) {
  }

  @Get()
  @ApiOkResponse({ type: [Player] })
  async findAll(
    @Param('gameId') gameId: string,
  ): Promise<Player[]> {
    return this.playerService.findAll(gameId);
  }

  @Get(':userId')
  @ApiOkResponse({ type: Player })
  @NotFound()
  async findOne(
    @Param('gameId') gameId: string,
    @Param('userId') userId: string,
  ): Promise<Player | undefined> {
    return this.playerService.findOne(gameId, userId);
  }
}
