import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Request,
  UnauthorizedException,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Auth, DEFAULT_DESCRIPTION } from '../auth/auth.decorator';
import { NotFound } from '../util/not-found.decorator';
import { Throttled } from '../util/throttled.decorator';
import { CreateMemberDto, UpdateMemberDto } from './member.dto';
import { Member } from './member.schema';
import { MemberService } from './member.service';

@Controller('games/:gameId/members')
@ApiTags('Game Members')
@UsePipes(ValidationPipe)
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
  async create(@Param('gameId') gameId: string, @Request() request, @Body() member: CreateMemberDto): Promise<Member> {
    const passwordMatch = await this.memberService.checkPassword(gameId, member);
    if (passwordMatch === undefined) {
      throw new NotFoundException(gameId);
    } else if (!passwordMatch) {
      throw new BadRequestException('Incorrect password.');
    }

    return this.memberService.create(gameId, request.user.id, member);
  }

  @Put(':userId')
  @ApiOperation({ description: 'Change game membership for the current user.' })
  @ApiOkResponse({ type: Member })
  @ApiUnauthorizedResponse({ description: `${DEFAULT_DESCRIPTION}, or when a non-owner attempts to change membership of someone else.` })
  @NotFound('Game or membership not found.')
  async update(@Param('gameId') gameId: string, @Param('userId') userId: string, @Request() request, @Body() updateMemberDto: UpdateMemberDto): Promise<Member | undefined> {
    const access = await this.memberService.checkUserModification(gameId, request.user, userId);
    switch (access) {
      case 'notfound':
        throw new NotFoundException(gameId);
      case 'unauthorized':
        throw new UnauthorizedException('Cannot change membership of another user.');
    }
    return this.memberService.update(gameId, userId, updateMemberDto);
  }

  @Delete(':userId')
  @ApiOperation({ description: 'Leave a game with the current user.' })
  @ApiOkResponse({ type: Member })
  @ApiUnauthorizedResponse({ description: `${DEFAULT_DESCRIPTION}, or when a non-owner attempts to kick someone else.` })
  @ApiConflictResponse({ description: 'Owner attempted to leave the game.' })
  @NotFound('Game or membership not found.')
  async delete(@Param('gameId') gameId: string, @Param('userId') userId: string, @Request() request): Promise<Member | undefined> {
    const access = await this.memberService.checkUserModification(gameId, request.user, userId);
    switch (access) {
      case 'notfound':
        throw new NotFoundException(gameId);
      case 'unauthorized':
        throw new UnauthorizedException('Cannot kick another user.');
      case 'owner':
        throw new BadRequestException('Cannot leave game as owner.');
    }
    return this.memberService.delete(gameId, userId);
  }
}
