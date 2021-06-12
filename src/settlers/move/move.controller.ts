import { Body, Controller, ForbiddenException, Param, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiForbiddenResponse, ApiTags } from '@nestjs/swagger';
import { Auth, AuthUser } from '../../auth/auth.decorator';
import { User } from '../../user/user.schema';
import { NotFound } from '../../util/not-found.decorator';
import { Throttled } from '../../util/throttled.decorator';
import { Validated } from '../../util/validated.decorator';
import { StateService } from '../state/state.service';
import { MoveDto } from './move.dto';
import { Move } from './move.schema';
import { MoveService } from './move.service';

@Controller('games/:gameId/moves')
@ApiTags('Settlers of Catan')
@Validated()
@Throttled()
@Auth()
export class MoveController {
  constructor(
    private stateService: StateService,
    private moveService: MoveService,
  ) {
  }

  @Post()
  @ApiCreatedResponse({ type: Move })
  @ApiForbiddenResponse({ description: 'Not your turn or action does not match game state.' })
  @NotFound('Game not found or not running.')
  async move(
    @AuthUser() user: User,
    @Param('gameId') gameId: string,
    @Body() dto: MoveDto,
  ): Promise<Move> {
    const state = await this.stateService.findByGame(gameId);
    if (!state) {
      return undefined;
    }
    if (state.activePlayer !== user._id) {
      throw new ForbiddenException('Not your turn!');
    }
    if (state.activeTask !== dto.action) {
      throw new ForbiddenException('You\'re not supposed to do that!');
    }
    return this.moveService.move(state, user, dto);
  }
}
