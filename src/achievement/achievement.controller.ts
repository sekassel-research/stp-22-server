import { Body, Controller, Delete, ForbiddenException, Get, Param, Patch, Put } from '@nestjs/common';
import { ApiCreatedResponse, ApiForbiddenResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Auth, AuthUser } from '../auth/auth.decorator';
import { User } from '../user/user.schema';
import { NotFound } from '../util/not-found.decorator';
import { ParseObjectIdPipe } from '../util/parse-object-id.pipe';
import { Throttled } from '../util/throttled.decorator';
import { Validated } from '../util/validated.decorator';
import { CreateAchievementDto, UpdateAchievementDto } from './achievement.dto';
import { Achievement } from './achievement.schema';
import { AchievementService } from './achievement.service';

@Controller('users/:userId/achievements')
@ApiTags('Achievements')
@Validated()
@Auth()
@Throttled()
export class AchievementController {
  constructor(
    private readonly achievementService: AchievementService,
  ) {
  }

  @Get()
  @ApiOkResponse({ type: [Achievement] })
  async findAll(
    @Param('userId', ParseObjectIdPipe) userId: string,
  ): Promise<Achievement[]> {
    return this.achievementService.findAll(userId);
  }

  @Get(':id')
  @ApiOkResponse({ type: Achievement })
  @NotFound()
  async findOne(
    @Param('userId', ParseObjectIdPipe) userId: string,
    @Param('id') id: string,
  ): Promise<Achievement | null> {
    return this.achievementService.findOne(userId, id);
  }

  @Put(':id')
  @ApiCreatedResponse({ type: Achievement })
  @ApiForbiddenResponse({ description: 'Adding an achievement to another user.' })
  async create(
    @AuthUser() user: User,
    @Param('userId', ParseObjectIdPipe) userId: string,
    @Param('id') id: string,
    @Body() achievement: CreateAchievementDto,
  ): Promise<Achievement> {
    if (user._id.toString() !== userId) {
      throw new ForbiddenException('Cannot add achievement for another user.');
    }
    return this.achievementService.create(userId, id, achievement);
  }

  @Patch(':id')
  @ApiOkResponse({ type: Achievement })
  @ApiForbiddenResponse({ description: 'Attempt to change achievement of another user.' })
  @NotFound()
  async update(
    @AuthUser() user: User,
    @Param('userId', ParseObjectIdPipe) userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateAchievementDto,
  ): Promise<Achievement | null> {
    if (user._id.toString() !== userId) {
      throw new ForbiddenException('Cannot change achievement of another user.');
    }
    return this.achievementService.update(userId, id, dto);
  }

  @Delete(':id')
  @ApiOkResponse({ type: Achievement })
  @ApiForbiddenResponse({ description: 'Attempt to delete achievement of another user.' })
  @NotFound()
  async delete(
    @AuthUser() user: User,
    @Param('userId', ParseObjectIdPipe) userId: string,
    @Param('id') id: string,
  ): Promise<Achievement | null> {
    if (user._id.toString() !== userId) {
      throw new ForbiddenException('Cannot delete achievement of another user.');
    }
    return this.achievementService.delete(userId, id);
  }
}
