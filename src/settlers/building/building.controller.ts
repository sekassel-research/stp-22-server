import { Controller, Get, Param } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Auth, AuthUser } from '../../auth/auth.decorator';
import { User } from '../../user/user.schema';
import { NotFound } from '../../util/not-found.decorator';
import { Throttled } from '../../util/throttled.decorator';
import { Validated } from '../../util/validated.decorator';
import { Building } from './building.schema';
import { BuildingService } from './building.service';

@Controller('games/:gameId/buildings')
@ApiTags('Pioneers')
@Validated()
@Throttled()
@Auth()
export class BuildingController {
  constructor(
    private buildingService: BuildingService,
  ) {
  }

  @Get()
  @ApiOkResponse({ type: [Building] })
  @NotFound()
  async find(
    @AuthUser() user: User,
    @Param('gameId') gameId: string,
  ): Promise<Building[]> {
    return this.buildingService.findAll({ gameId });
  }

  @Get(':buildingId')
  @ApiOkResponse({ type: Building })
  @NotFound()
  async findOne(
    @AuthUser() user: User,
    @Param('gameId') gameId: string,
    @Param('buildingId') buildingId: string,
  ): Promise<Building> {
    return this.buildingService.findOne(buildingId);
  }
}
