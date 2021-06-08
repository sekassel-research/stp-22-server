import {
  BadRequestException,
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
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Auth, AuthUser } from '../auth/auth.decorator';
import { User } from '../user/user.schema';
import { NotFound } from '../util/not-found.decorator';
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
  ) {
  }

  @Get()
  @ApiOkResponse({ type: [Member] })
  async findAll(@Param('gameId') gameId: string): Promise<Member[]> {
    return this.memberService.findAll(gameId);
  }

  @Get(':userId')
  @ApiOkResponse({ type: Member })
  @NotFound()
  async findOne(@Param('gameId') gameId: string, @Param('userId') userId: string): Promise<Member | undefined> {
    return this.memberService.findOne(gameId, userId);
  }

  @Post()
  @ApiOperation({ description: 'Join a game with the current user.' })
  @ApiCreatedResponse({ type: Member })
  @ApiNotFoundResponse({ description: 'Game not found.' })
  @ApiBadRequestResponse({ description: 'Incorrect password.' })
  async create(
    @AuthUser() user: User,
    @Param('gameId') gameId: string,
    @Body() member: CreateMemberDto,
  ): Promise<Member> {
    const passwordMatch = await this.memberService.checkPassword(gameId, member);
    if (passwordMatch === undefined) {
      throw new NotFoundException(gameId);
    } else if (!passwordMatch) {
      throw new BadRequestException('Incorrect password.');
    }

    return this.memberService.create(gameId, user._id, member);
  }

  @Patch(':userId')
  @ApiOperation({ description: 'Change game membership for the current user.' })
  @ApiOkResponse({ type: Member })
  @ApiForbiddenResponse({ description: 'Attempt to change membership of someone else without being owner.' })
  @NotFound('Game or membership not found.')
  async update(
    @AuthUser() user: User,
    @Param('gameId') gameId: string,
    @Param('userId') userId: string,
    @Body() dto: UpdateMemberDto,
  ): Promise<Member | undefined> {
    const access = await this.memberService.checkUserModification(gameId, user, userId);
    switch (access) {
      case 'notfound':
        throw new NotFoundException(gameId);
      case 'unauthorized':
        throw new ForbiddenException('Cannot change membership of another user.');
    }
    return this.memberService.update(gameId, userId, dto);
  }

  @Delete(':userId')
  @ApiOperation({ description: 'Leave a game with the current user.' })
  @ApiOkResponse({ type: Member })
  @ApiForbiddenResponse({ description: 'Attempt to kick someone else without being owner.' })
  @ApiConflictResponse({ description: 'Owner attempted to leave the game.' })
  @NotFound('Game or membership not found.')
  async delete(
    @AuthUser() user: User,
    @Param('gameId') gameId: string,
    @Param('userId') userId: string,
  ): Promise<Member | undefined> {
    const access = await this.memberService.checkUserModification(gameId, user, userId);
    switch (access) {
      case 'notfound':
        throw new NotFoundException(gameId);
      case 'unauthorized':
        throw new ForbiddenException('Cannot kick another user.');
      case 'owner':
        throw new ConflictException('Cannot leave game as owner.');
    }
    return this.memberService.delete(gameId, userId);
  }
}
