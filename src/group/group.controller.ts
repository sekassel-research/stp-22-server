import { Body, Controller, Delete, ForbiddenException, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiCreatedResponse, ApiForbiddenResponse, ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Auth, AuthUser } from '../auth/auth.decorator';
import { User } from '../user/user.schema';
import { NotFound } from '../util/not-found.decorator';
import { ParseObjectIdPipe } from '../util/parse-object-id.pipe';
import { Throttled } from '../util/throttled.decorator';
import { Validated } from '../util/validated.decorator';
import { CreateGroupDto, UpdateGroupDto } from './group.dto';
import { Group } from './group.schema';
import { GroupService } from './group.service';

@Controller('groups')
@ApiTags('Groups')
@Validated()
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
  @ApiForbiddenResponse({ description: 'Attempt to get groups in which the current user is not a member.' })
  async findAll(@AuthUser() user: User, @Query('members') members?: string): Promise<Group[]> {
    if (members) {
      const memberList = members.split(',');
      this.checkMembership(memberList, user);
      return this.groupService.findByMembers(memberList);
    }
    return this.groupService.findByMember(user._id);
  }

  @Get(':id')
  @ApiOkResponse({ type: Group })
  @ApiForbiddenResponse({ description: 'Attempt to get a group in which the current user is not a member.' })
  @NotFound()
  async findOne(@AuthUser() user: User, @Param('id', ParseObjectIdPipe) id: string): Promise<Group | undefined> {
    const group = await this.groupService.find(id);
    if (!group) {
      return undefined;
    }
    this.checkMembership(group.members, user);
    return group;
  }

  @Post()
  @ApiCreatedResponse({ type: Group })
  @ApiForbiddenResponse({ description: 'Attempt to create a group in which the current user is not a member.' })
  async create(@AuthUser() user: User, @Body() dto: CreateGroupDto): Promise<Group> {
    this.checkMembership(dto.members, user);
    return this.groupService.create(dto);
  }

  @Patch(':id')
  @ApiOkResponse({ type: Group })
  @ApiForbiddenResponse({ description: 'Attempt to change a group in which the current user is not or will not be a member.' })
  @NotFound()
  async update(@AuthUser() user: User, @Param('id', ParseObjectIdPipe) id: string, @Body() dto: UpdateGroupDto): Promise<Group | undefined> {
    this.checkMembership(dto.members, user);
    const existing = await this.groupService.find(id);
    if (!existing) {
      return undefined;
    }
    this.checkMembership(existing.members, user);
    return this.groupService.update(id, dto);
  }

  @Delete(':id')
  @ApiOkResponse({ type: Group })
  @ApiForbiddenResponse({ description: 'Attempt to delete a group in which the current user is not a member.' })
  @NotFound()
  async delete(@AuthUser() user: User, @Param('id', ParseObjectIdPipe) id: string): Promise<Group | undefined> {
    const existing = await this.groupService.find(id);
    if (!existing) {
      return undefined;
    }
    this.checkMembership(existing.members, user);
    return this.groupService.delete(id);
  }

  private checkMembership(members: string[], user: User) {
    if (!members.includes(user._id)) {
      throw new ForbiddenException('You are not a member of this group.');
    }
  }
}
