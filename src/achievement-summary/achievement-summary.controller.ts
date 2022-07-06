import { Controller, Get, Param } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AchievementService } from '../achievement/achievement.service';
import { Throttled } from '../util/throttled.decorator';
import { Validated } from '../util/validated.decorator';
import { AchievementSummary } from './achievement-summary.dto';

@Controller('achievements')
@ApiTags('Achievements')
@Validated()
@Throttled()
export class AchievementSummaryController {
  constructor(
    private readonly achievementService: AchievementService,
  ) {
  }

  @Get()
  @ApiOkResponse({ type: [AchievementSummary] })
  async findAll(): Promise<AchievementSummary[]> {
    return this.achievementService.summary();
  }

  @Get(':id')
  @ApiOkResponse({ type: AchievementSummary })
  async findOne(
    @Param('id') id: string,
  ): Promise<AchievementSummary> {
    return this.achievementService.summaryOne(id);
  }
}
