import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Request,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Auth } from '../auth/auth.decorator';
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
  @ApiNotFoundResponse()
  async findOne(@Param('gameId') gameId: string, @Param('userId') userId: string): Promise<Member | undefined> {
    return this.memberService.findOne(gameId, userId);
  }

  @Post()
  @ApiOperation({ description: 'Join a game with the current user.' })
  @ApiCreatedResponse({ type: Member })
  @ApiBadRequestResponse({ description: 'Incorrect password.' })
  async create(@Param('gameId') gameId: string, @Request() request, @Body() createMemberDto: CreateMemberDto): Promise<Member> {
    return this.memberService.create(gameId, request.user, createMemberDto);
  }

  @Put(':userId')
  @ApiOperation({ description: 'Change game membership for the current user.' })
  @ApiOkResponse({ type: Member })
  @ApiBadRequestResponse({ description: 'Attempting to change membership of another user who is not the current user.' })
  @NotFound()
  async update(@Param('gameId') gameId: string, @Param('userId') userId: string, @Request() request, @Body() updateMemberDto: UpdateMemberDto): Promise<Member | undefined> {
    if (request.user.id !== userId) {
      throw new BadRequestException('Cannot change membership of another user.');
    }
    return this.memberService.update(gameId, userId, updateMemberDto);
  }

  @Delete(':userId')
  @ApiOperation({ description: 'Leave a game with the current user.' })
  @ApiOkResponse({ type: Member })
  @ApiBadRequestResponse({ description: 'Attempting to kick another user who is not the current user.' })
  @NotFound()
  async delete(@Param('gameId') gameId: string, @Param('userId') userId: string, @Request() request): Promise<Member | undefined> {
    if (request.user.id !== userId) {
      throw new BadRequestException('Cannot kick another user.');
    }
    return this.memberService.delete(gameId, userId);
  }
}
