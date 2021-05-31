import { Body, Controller, Delete, Get, Param, Post, Put, Request, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
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
  @ApiCreatedResponse({ type: Member })
  async create(@Param('gameId') gameId: string, @Request() request, @Body() createMemberDto: CreateMemberDto): Promise<Member> {
    return this.memberService.create(gameId, request.user, createMemberDto);
  }

  @Put(':userId')
  @ApiOkResponse({ type: Member })
  @NotFound()
  async update(@Param('gameId') gameId: string, @Param('userId') userId: string, @Body() updateMemberDto: UpdateMemberDto): Promise<Member | undefined> {
    return this.memberService.update(gameId, userId, updateMemberDto);
  }

  @Delete(':userId')
  @ApiOkResponse({ type: Member })
  @NotFound()
  async delete(@Param('gameId') gameId: string, @Param('userId') userId: string): Promise<Member | undefined> {
    return this.memberService.delete(gameId, userId);
  }
}
