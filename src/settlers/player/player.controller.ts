import { Body, Controller, ForbiddenException, Get, Param, Patch } from '@nestjs/common';
import { ApiForbiddenResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AuthUser } from '../../auth/auth.decorator';
import { MemberAuth } from '../../member/member-auth.decorator';
import { User } from '../../user/user.schema';
import { NotFound } from '../../util/not-found.decorator';
import { ParseObjectIdPipe } from '../../util/parse-object-id.pipe';
import { Throttled } from '../../util/throttled.decorator';
import { Validated } from '../../util/validated.decorator';
import { StateService } from '../state/state.service';
import { UpdatePlayerDto } from './player.dto';
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
    private stateService: StateService,
  ) {
  }

  @Get()
  @ApiOkResponse({ type: [Player] })
  async findAll(
    @AuthUser() user: User,
    @Param('gameId', ParseObjectIdPipe) gameId: string,
  ): Promise<Player[]> {
    const players = await this.playerService.findAll(gameId);
    const gameOver = await this.isGameOver(gameId);
    return gameOver ? players : players.map(p => this.maskResourcesIfOpponent(user, p));
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

    const gameOver = await this.isGameOver(gameId);
    return gameOver ? player : this.maskResourcesIfOpponent(user, player);
  }

  @Patch(':userId')
  @ApiOkResponse({ type: Player })
  @ApiForbiddenResponse({ description: 'Attempting to update someone else\'s player.' })
  @NotFound()
  async update(
    @AuthUser() user: User,
    @Param('gameId', ParseObjectIdPipe) gameId: string,
    @Param('userId', ParseObjectIdPipe) userId: string,
    @Body() dto: UpdatePlayerDto,
  ): Promise<Player | null> {
    if (userId !== user._id.toString()) {
      throw new ForbiddenException('You may only update your own player');
    }
    return this.playerService.update(gameId, userId, dto);
  }

  private async isGameOver(gameId: string): Promise<boolean> {
    return !!(await this.stateService.findByGame(gameId))?.winner;
  }

  private maskResourcesIfOpponent(user: User, player: PlayerDocument): Player {
    if (player.userId === user._id.toString()) {
      return player;
    }

    return this.playerService.mask(player);
  }
}
