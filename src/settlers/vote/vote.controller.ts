import {
  Body,
  ConflictException,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiConflictResponse, ApiCreatedResponse, ApiForbiddenResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Auth, AuthUser } from '../../auth/auth.decorator';
import { User } from '../../user/user.schema';
import { NotFound } from '../../util/not-found.decorator';
import { ParseObjectIdPipe } from '../../util/parse-object-id.pipe';
import { Throttled } from '../../util/throttled.decorator';
import { Validated } from '../../util/validated.decorator';
import { CreateVoteDto } from './vote.dto';
import { Vote } from './vote.schema';
import { VoteService } from './vote.service';

@Controller('maps/:mapId/votes')
@ApiTags('Map Votes')
@Validated()
@Auth()
@Throttled()
export class VoteController {
  constructor(
    private voteService: VoteService,
  ) {
  }

  @Post()
  @ApiCreatedResponse({ type: Vote })
  @ApiConflictResponse({ description: 'Attempt to cast another vote' })
  async create(
    @Param('mapId', ParseObjectIdPipe) mapId: string,
    @AuthUser() user: User,
    @Body() dto: CreateVoteDto,
  ): Promise<Vote> {
    try {
      return await this.voteService.create(mapId, user._id.toString(), dto);
    } catch (err: any) {
      if (err.code === 11000) {
        throw new ConflictException('You already voted on this map');
      }
      throw err;
    }
  }

  @Get()
  @ApiOkResponse({ type: [Vote] })
  async findAll(
    @Param('mapId', ParseObjectIdPipe) mapId: string,
  ): Promise<Vote[]> {
    return this.voteService.findAll({ mapId });
  }

  @Get(':userId')
  @ApiOkResponse({ type: Vote })
  @NotFound()
  async findOne(
    @Param('mapId', ParseObjectIdPipe) mapId: string,
    @Param('userId', ParseObjectIdPipe) userId: string,
  ): Promise<Vote | null> {
    return this.voteService.find(mapId, userId);
  }

  @Patch(':userId')
  @ApiOkResponse({ type: Vote })
  @ApiForbiddenResponse({ description: 'Attempt to change someone else\'s vote.' })
  @NotFound()
  async update(
    @AuthUser() user: User,
    @Param('mapId', ParseObjectIdPipe) mapId: string,
    @Param('userId', ParseObjectIdPipe) userId: string,
    @Body() dto: CreateVoteDto,
  ): Promise<Vote | null> {
    if (user._id.toString() !== userId) {
      throw new ForbiddenException('You cannot update someone else\'s vote.');
    }
    return this.voteService.update(mapId, userId, dto);
  }

  @Delete(':userId')
  @ApiOkResponse({ type: Vote })
  @ApiForbiddenResponse({ description: 'Attempt to delete a vote that was not cast by the current user.' })
  @NotFound()
  async delete(
    @AuthUser() user: User,
    @Param('mapId', ParseObjectIdPipe) mapId: string,
    @Param('userId', ParseObjectIdPipe) userId: string,
  ): Promise<Vote | null> {
    if (user._id.toString() !== userId) {
      throw new ForbiddenException('You cannot delete someone else\'s vote.');
    }
    return this.voteService.delete(mapId, userId);
  }
}
