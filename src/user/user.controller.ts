import { Controller, Get, Param } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
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
  async getUsers(): Promise<User[]> {
    return this.userService.getOnlineUsers();
  }

  @Get(':id')
  @ApiOperation({ description: 'Informs about the user with the given ID.' })
  @ApiOkResponse({ type: User })
  @ApiNotFoundResponse()
  async getUser(@Param('id') id: string) {
    return this.userService.getOnlineUser(id);
  }
}
