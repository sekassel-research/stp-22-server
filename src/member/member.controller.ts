import {
  Body,
  ConflictException,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Auth, AuthUser } from '../auth/auth.decorator';
import { GameService } from '../game/game.service';
import { User } from '../user/user.schema';
import { NotFound } from '../util/not-found.decorator';
import { ParseObjectIdPipe } from '../util/parse-object-id.pipe';
import { Throttled } from '../util/throttled.decorator';
import { Validated } from '../util/validated.decorator';
import { CreateMemberDto, UpdateMemberDto } from './member.dto';
import { Member } from './member.schema';
import { MemberService } from './member.service';

@Controller('games/:gameId/members')
@ApiTags('Game Members')
@Validated()
@Auth()
@Throttled()
export class MemberController {
  constructor(
    private readonly memberService: MemberService,
    private readonly gameService: GameService,
  ) {
  }

  @Get()
  @ApiOkResponse({ type: [Member] })
  async findAll(
    @Param('gameId', ParseObjectIdPipe) gameId: string,
  ): Promise<Member[]> {
    return this.memberService.findAll(gameId);
  }

  @Get(':userId')
  @ApiOkResponse({ type: Member })
  @NotFound()
  async findOne(
    @Param('gameId', ParseObjectIdPipe) gameId: string,
    @Param('userId', ParseObjectIdPipe) userId: string,
  ): Promise<Member | undefined> {
    return this.memberService.findOne(gameId, userId);
  }

  @Post()
  @ApiOperation({ description: 'Join a game with the current user.' })
  @ApiCreatedResponse({ type: Member })
  @ApiNotFoundResponse({ description: 'Game not found.' })
  @ApiForbiddenResponse({ description: 'Incorrect password.' })
  @ApiConflictResponse({ description: 'Game already started or user already joined.' })
  async create(
    @AuthUser() user: User,
    @Param('gameId', ParseObjectIdPipe) gameId: string,
    @Body() member: CreateMemberDto,
  ): Promise<Member> {
    const game = await this.gameService.findOne(gameId);
    if (!game) {
      throw new NotFoundException(gameId);
    }

    const passwordMatch = await this.memberService.checkPassword(game, member);
    if (!passwordMatch) {
      throw new ForbiddenException('Incorrect password');
    }

    if (game.started) {
      throw new ConflictException('Game already started');
    }

    const existing = await this.memberService.findOne(gameId, user._id);
    if (existing) {
      throw new ConflictException('User already joined');
    }

    return this.memberService.create(gameId, user._id, member);
  }

  @Patch(':userId')
  @ApiOperation({ description: 'Change game membership for the current user.' })
  @ApiOkResponse({ type: Member })
  @ApiConflictResponse({ description: 'Game already started.' })
  @ApiForbiddenResponse({ description: 'Attempt to change membership of someone else without being owner.' })
  @NotFound('Game or membership not found.')
  async update(
    @AuthUser() user: User,
    @Param('gameId', ParseObjectIdPipe) gameId: string,
    @Param('userId', ParseObjectIdPipe) userId: string,
    @Body() dto: UpdateMemberDto,
  ): Promise<Member | undefined> {
    const access = await this.memberService.checkUserModification(gameId, user, userId);
    switch (access) {
      case 'notfound':
        throw new NotFoundException(gameId);
      case 'started':
        throw new ConflictException('Game already started');
      case 'unauthorized':
        throw new ForbiddenException('Cannot change membership of another user.');
    }
    return this.memberService.update(gameId, userId, dto);
  }

  @Delete(':userId')
  @ApiOperation({ description: 'Leave a game with the current user.' })
  @ApiOkResponse({ type: Member })
  @ApiForbiddenResponse({ description: 'Attempt to kick someone else without being owner.' })
  @ApiConflictResponse({ description: 'Game is already running or owner attempted to leave the game.' })
  @NotFound('Game or membership not found.')
  async delete(
    @AuthUser() user: User,
    @Param('gameId', ParseObjectIdPipe) gameId: string,
    @Param('userId', ParseObjectIdPipe) userId: string,
  ): Promise<Member | undefined> {
    const access = await this.memberService.checkUserModification(gameId, user, userId);
    switch (access) {
      case 'notfound':
        throw new NotFoundException(gameId);
      case 'started':
        throw new ConflictException('Cannot leave running game.');
      case 'unauthorized':
        throw new ForbiddenException('Cannot kick another user.');
      case 'owner-target':
        throw new ConflictException('Cannot leave game as owner.');
    }
    return this.memberService.delete(gameId, userId);
  }
}
