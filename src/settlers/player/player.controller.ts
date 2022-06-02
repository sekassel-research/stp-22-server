import { Controller, Get, Param } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AuthUser } from '../../auth/auth.decorator';
import { MemberAuth } from '../../member/member-auth.decorator';
import { User } from '../../user/user.schema';
import { NotFound } from '../../util/not-found.decorator';
import { ParseObjectIdPipe } from '../../util/parse-object-id.pipe';
import { Throttled } from '../../util/throttled.decorator';
import { Validated } from '../../util/validated.decorator';
import { Player, PlayerDocument } from './player.schema';
import { PlayerService } from './player.service';

@Controller('games/:gameId/players')
@ApiTags('Pioneers')
@Validated()
@Throttled()
@MemberAuth()
export class PlayerController {
  constructor(
    private playerService: PlayerService,
  ) {
  }

  @Get()
  @ApiOkResponse({ type: [Player] })
  async findAll(
    @AuthUser() user: User,
    @Param('gameId', ParseObjectIdPipe) gameId: string,
  ): Promise<Player[]> {
    const players = await this.playerService.findAll(gameId);
    return players.map(p => this.maskResourcesIfOpponent(user, p));
  }

  @Get(':userId')
  @ApiOkResponse({ type: Player })
  @NotFound()
  async findOne(
    @AuthUser() user: User,
    @Param('gameId', ParseObjectIdPipe) gameId: string,
    @Param('userId', ParseObjectIdPipe) userId: string,
  ): Promise<Player | undefined> {
    const player = await this.playerService.findOne(gameId, userId);
    if (!player) {
      return undefined;
    }

    return this.maskResourcesIfOpponent(user, player);
  }

  private maskResourcesIfOpponent(user: User, player: PlayerDocument): Player {
    if (player.userId === user._id.toString()) {
      return player;
    }

    return this.playerService.mask(player);
  }
}
