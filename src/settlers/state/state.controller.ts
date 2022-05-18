import { Controller, Get, Param } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { MemberAuth } from '../../member/member-auth.decorator';
import { NotFound } from '../../util/not-found.decorator';
import { ParseObjectIdPipe } from '../../util/parse-object-id.pipe';
import { Throttled } from '../../util/throttled.decorator';
import { Validated } from '../../util/validated.decorator';
import { State } from './state.schema';
import { StateService } from './state.service';

@Controller()
@ApiTags('Pioneers')
@Validated()
@Throttled()
@MemberAuth()
export class StateController {
  constructor(
    private stateService: StateService,
  ) {
  }

  @Get('games/:gameId/state')
  @ApiOkResponse({ type: State })
  @NotFound()
  async find(
    @Param('gameId', ParseObjectIdPipe) gameId: string,
  ): Promise<State | undefined> {
    return this.stateService.findByGame(gameId);
  }
}
