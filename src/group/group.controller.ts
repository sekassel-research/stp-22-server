import { Controller, Get, Param, Request, UnauthorizedException, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { Auth } from '../auth/auth.decorator';
import { NotFound } from '../util/not-found.decorator';
import { Throttled } from '../util/throttled.decorator';
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
  @ApiOperation({ description: 'Find all groups in which the current user is a member.' })
  @ApiOkResponse({ type: [Group] })
  async findAll(@Request() request): Promise<Group[]> {
    return this.groupService.findByMember(request.user.id);
  }

  @Get(':id')
  @ApiOkResponse({ type: Group })
  @ApiUnauthorizedResponse({ description: 'Attempting to get a group in which the current user is not a member.' })
  @NotFound()
  async findOne(@Request() request, @Param('id') id: string): Promise<Group | undefined> {
    const group = await this.groupService.find(id);
    if (group.members.includes(request.user.id)) {
      throw new UnauthorizedException('You are not a member of this group.');
    }
    return group;
  }
}
