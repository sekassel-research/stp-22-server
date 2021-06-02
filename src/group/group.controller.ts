import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
  UnauthorizedException,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiQuery, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { Auth } from '../auth/auth.decorator';
import { NotFound } from '../util/not-found.decorator';
import { Throttled } from '../util/throttled.decorator';
import { CreateGroupDto, UpdateGroupDto } from './group.dto';
import { Group } from './group.schema';
import { GroupService } from './group.service';

@Controller('groups')
@ApiTags('Groups')
@UsePipes(ValidationPipe)
@Auth()
@Throttled()
export class GroupController {
  constructor(
    private groupService: GroupService,
  ) {
  }

  @Get()
  @ApiQuery({
    name: 'members',
    required: false,
    description: 'A comma-separated list of member user IDs. ' +
      'If specified, returns only groups with the exact member list (order-insensitive). ' +
      'Otherwise, returns all groups in which the current user is a member.',
  })
  @ApiOkResponse({ type: [Group] })
  @ApiUnauthorizedResponse({ description: 'Attempting to get groups in which the current user is not a member.' })
  async findAll(@Request() request, @Query('members') members?: string): Promise<Group[]> {
    if (members) {
      const memberList = members.split(',');
      this.checkMemberShip(memberList, request);
      return this.groupService.findByMembers(memberList);
    }
    return this.groupService.findByMember(request.user.id);
  }

  @Get(':id')
  @ApiOkResponse({ type: Group })
  @ApiUnauthorizedResponse({ description: 'Attempting to get a group in which the current user is not a member.' })
  @NotFound()
  async findOne(@Request() request, @Param('id') id: string): Promise<Group | undefined> {
    const group = await this.groupService.find(id);
    this.checkMemberShip(group.members, request);
    return group;
  }

  @Post()
  @ApiCreatedResponse({ type: Group })
  @ApiUnauthorizedResponse({ description: 'Attempting to create a group in which the current user is not a member.' })
  async create(@Request() request, @Body() dto: CreateGroupDto): Promise<Group> {
    this.checkMemberShip(dto.members, request);
    return this.groupService.create(dto);
  }

  @Put(':id')
  @ApiOkResponse({ type: Group })
  @ApiUnauthorizedResponse({ description: 'Attempting to change a group in which the current user is not or will not be a member.' })
  @NotFound()
  async update(@Request() request, @Param('id') id: string, @Body() dto: UpdateGroupDto): Promise<Group | undefined> {
    this.checkMemberShip(dto.members, request);
    const existing = await this.groupService.find(id);
    if (!existing) {
      return undefined;
    }
    this.checkMemberShip(existing.members, request);
    return this.groupService.update(id, dto);
  }

  @Delete(':id')
  @ApiOkResponse({ type: Group })
  @ApiUnauthorizedResponse({ description: 'Attempting to delete a group in which the current user is not a member.' })
  @NotFound()
  async delete(@Request() request, @Param('id') id: string): Promise<Group | undefined> {
    const existing = await this.groupService.find(id);
    if (!existing) {
      return undefined;
    }
    this.checkMemberShip(existing.members, request);
    return this.groupService.delete(id);
  }

  private checkMemberShip(members: string[], request) {
    if (members.includes(request.user.id)) {
      throw new UnauthorizedException('You are not a member of this group.');
    }
  }
}
