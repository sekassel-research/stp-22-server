import { Controller, Get, Param } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AuthUser } from '../auth/auth.decorator';
import { User } from '../user/user.schema';
import { NotFound } from '../util/not-found.decorator';
import { Throttled } from '../util/throttled.decorator';
import { Validated } from '../util/validated.decorator';
import { Map } from './settlers.schema';
import { SettlersService } from './settlers.service';

@Controller('games/:gameId')
@ApiTags('Settlers of Catan')
@Validated()
@Throttled()
export class SettlersController {
  constructor(
    private settlersService: SettlersService,
  ) {
  }

  @Get('map')
  @ApiOkResponse({ type: Map })
  @NotFound()
  async getMap(
    @AuthUser() user: User,
    @Param('gameId') gameId: string,
  ): Promise<Map | undefined> {
    return this.settlersService.findGameMap(gameId);
  }
}
