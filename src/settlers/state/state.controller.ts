import { Controller, Get, Param } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Auth, AuthUser } from '../../auth/auth.decorator';
import { User } from '../../user/user.schema';
import { NotFound } from '../../util/not-found.decorator';
import { Throttled } from '../../util/throttled.decorator';
import { Validated } from '../../util/validated.decorator';
import { State } from './state.schema';
import { StateService } from './state.service';

@Controller()
@ApiTags('Pioneers')
@Validated()
@Throttled()
@Auth()
export class StateController {
  constructor(
    private stateService: StateService,
  ) {
  }

  @Get('games/:gameId/state')
  @ApiOkResponse({ type: State })
  @NotFound()
  async find(
    @AuthUser() user: User,
    @Param('gameId') gameId: string,
  ): Promise<State | undefined> {
    return this.stateService.findByGame(gameId);
  }
}
