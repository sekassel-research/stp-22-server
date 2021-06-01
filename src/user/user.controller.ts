import { Controller, Get, Param, Post, Query, Request } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Auth } from '../auth/auth.decorator';
import { NotFound } from '../util/not-found.decorator';
import { User } from './user.dto';
import { UserService } from './user.service';

@Controller('users')
@ApiTags('Users')
export class UserController {
  constructor(
    private userService: UserService,
  ) {
  }

  @Get()
  @ApiOperation({ description: 'Lists all online users.' })
  @ApiOkResponse({ type: [User] })
  @ApiQuery({
    name: 'ids',
    required: false,
    description: 'A comma-separated list of IDs that should be included in the response.',
  })
  async getUsers(@Query('ids') ids?: string): Promise<User[]> {
    return this.userService.getOnlineUsers(ids?.split(','));
  }

  @Get(':id')
  @ApiOperation({ description: 'Informs about the user with the given ID.' })
  @ApiOkResponse({ type: User })
  @NotFound()
  async getUser(@Param('id') id: string): Promise<User> {
    return this.userService.getOnlineUser(id);
  }

  @Post('login')
  @Auth()
  @ApiOperation({ description: 'Sets the current user online.' })
  @ApiOkResponse()
  async login(@Request() { user }: { user: User }): Promise<void> {
    return this.userService.login(user);
  }

  @Post('logout')
  @Auth()
  @ApiOperation({ description: 'Sets the current user offline.' })
  @ApiOkResponse()
  async logout(@Request() { user }: { user: User }): Promise<void> {
    return this.userService.logout(user);
  }
}
