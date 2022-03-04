import { Controller, Get, Param } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Auth, AuthUser } from '../../auth/auth.decorator';
import { User } from '../../user/user.schema';
import { NotFound } from '../../util/not-found.decorator';
import { Throttled } from '../../util/throttled.decorator';
import { Validated } from '../../util/validated.decorator';
import { Player, PlayerDocument } from './player.schema';
import { PlayerService } from './player.service';

@Controller('games/:gameId/players')
@ApiTags('Settlers of Catan')
@Validated()
@Throttled()
@Auth()
export class PlayerController {
  constructor(
    private playerService: PlayerService,
  ) {
  }

  @Get()
  @ApiOkResponse({ type: [Player] })
  async findAll(
    @AuthUser() user: User,
    @Param('gameId') gameId: string,
  ): Promise<Player[]> {
    const players = await this.playerService.findAll(gameId);
    return players.map(p => this.maskResourcesIfOpponent(user, p));
  }

  @Get(':userId')
  @ApiOkResponse({ type: Player })
  @NotFound()
  async findOne(
    @AuthUser() user: User,
    @Param('gameId') gameId: string,
    @Param('userId') userId: string,
  ): Promise<Player | undefined> {
    const player = await this.playerService.findOne(gameId, userId);
    if (!player) {
      return undefined;
    }

    return this.maskResourcesIfOpponent(user, player);
  }

  private maskResourcesIfOpponent(user: User, player: PlayerDocument): Player {
    if (player.userId === user._id) {
      return player;
    }

    return this.playerService.mask(player);
  }
}
