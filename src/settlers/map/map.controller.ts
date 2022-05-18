import { Controller, Get, Param } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Auth, AuthUser } from '../../auth/auth.decorator';
import { User } from '../../user/user.schema';
import { NotFound } from '../../util/not-found.decorator';
import { Throttled } from '../../util/throttled.decorator';
import { Validated } from '../../util/validated.decorator';
import { Map } from './map.schema';
import { MapService } from './map.service';

@Controller()
@ApiTags('Pioneers')
@Validated()
@Throttled()
@Auth()
export class MapController {
  constructor(
    private settlersService: MapService,
  ) {
  }

  @Get('games/:gameId/map')
  @ApiOkResponse({ type: Map })
  @NotFound()
  async find(
    @AuthUser() user: User,
    @Param('gameId') gameId: string,
  ): Promise<Map | undefined> {
    return this.settlersService.findByGame(gameId);
  }
}
