import { Body, Controller, Param, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiForbiddenResponse, ApiTags } from '@nestjs/swagger';
import { Auth, AuthUser } from '../../auth/auth.decorator';
import { User } from '../../user/user.schema';
import { NotFound } from '../../util/not-found.decorator';
import { ParseObjectIdPipe } from '../../util/parse-object-id.pipe';
import { Throttled } from '../../util/throttled.decorator';
import { Validated } from '../../util/validated.decorator';
import { GameLogicService } from './game-logic/game-logic.service';
import { CreateMoveDto } from './move.dto';
import { Move } from './move.schema';

@Controller('games/:gameId/moves')
@ApiTags('Pioneers')
@Validated()
@Throttled()
@Auth()
export class MoveController {
  constructor(
    private gameLogicService: GameLogicService,
  ) {
  }

  @Post()
  @ApiCreatedResponse({ type: Move })
  @ApiForbiddenResponse({ description: 'Not your turn or action does not match game state.' })
  @NotFound('Game not found or not running.')
  async move(
    @AuthUser() user: User,
    @Param('gameId', ParseObjectIdPipe) gameId: string,
    @Body() dto: CreateMoveDto,
  ): Promise<Move> {
    return this.gameLogicService.handle(gameId, user._id, dto);
  }
}
