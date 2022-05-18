import { Controller, Get, Param } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { MemberAuth } from '../../member/member-auth.decorator';
import { NotFound } from '../../util/not-found.decorator';
import { ParseObjectIdPipe } from '../../util/parse-object-id.pipe';
import { Throttled } from '../../util/throttled.decorator';
import { Validated } from '../../util/validated.decorator';
import { Map } from './map.schema';
import { MapService } from './map.service';

@Controller()
@ApiTags('Pioneers')
@Validated()
@Throttled()
@MemberAuth()
export class MapController {
  constructor(
    private settlersService: MapService,
  ) {
  }

  @Get('games/:gameId/map')
  @ApiOkResponse({ type: Map })
  @NotFound()
  async find(
    @Param('gameId', ParseObjectIdPipe) gameId: string,
  ): Promise<Map | undefined> {
    return this.settlersService.findByGame(gameId);
  }
}
