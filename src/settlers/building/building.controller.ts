import { Controller, Get, Param } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { MemberAuth } from '../../member/member-auth.decorator';
import { NotFound } from '../../util/not-found.decorator';
import { ParseObjectIdPipe } from '../../util/parse-object-id.pipe';
import { Throttled } from '../../util/throttled.decorator';
import { Validated } from '../../util/validated.decorator';
import { Building } from './building.schema';
import { BuildingService } from './building.service';

@Controller('games/:gameId/buildings')
@ApiTags('Pioneers')
@Validated()
@Throttled()
@MemberAuth()
export class BuildingController {
  constructor(
    private buildingService: BuildingService,
  ) {
  }

  @Get()
  @ApiOkResponse({ type: [Building] })
  @NotFound()
  async find(
    @Param('gameId', ParseObjectIdPipe) gameId: string,
  ): Promise<Building[]> {
    return this.buildingService.findAll(gameId);
  }

  @Get(':buildingId')
  @ApiOkResponse({ type: Building })
  @NotFound()
  async findOne(
    @Param('gameId', ParseObjectIdPipe) gameId: string,
    @Param('buildingId', ParseObjectIdPipe) buildingId: string,
  ): Promise<Building | null> {
    return this.buildingService.findOne(buildingId);
  }
}
