import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Auth } from '../auth/auth.decorator';
import { NotFound } from '../util/not-found.decorator';
import { Throttled } from '../util/throttled.decorator';
import { Validated } from '../util/validated.decorator';
import { CreateUserDto } from './user.dto';
import { User } from './user.schema';
import { UserService } from './user.service';

@Controller('users')
@ApiTags('Users')
@Validated()
@Throttled()
export class UserController {
  constructor(
    private userService: UserService,
  ) {
  }

  @Get()
  @Auth()
  @ApiOperation({ description: 'Lists all online users.' })
  @ApiOkResponse({ type: [User] })
  @ApiQuery({
    name: 'ids',
    required: false,
    description: 'A comma-separated list of IDs that should be included in the response.',
  })
  @ApiQuery({
    name: 'online',
    required: false,
    type: Boolean,
    description: 'When set, finds only online users and ignores the `ids` query parameter.',
  })
  async getUsers(@Query('ids') ids?: string, @Query('online') online?: boolean): Promise<User[]> {
    return online ? this.userService.findOnline() : this.userService.findAll(ids?.split(','));
  }

  @Get(':id')
  @Auth()
  @ApiOperation({ description: 'Informs about the user with the given ID.' })
  @ApiOkResponse({ type: User })
  @NotFound()
  async getUser(@Param('id') id: string): Promise<User> {
    return this.userService.find(id);
  }

  @Post()
  @ApiOperation({ description: 'Create a new user (sign up).' })
  @ApiCreatedResponse({ type: User })
  async create(@Body() dto: CreateUserDto): Promise<User> {
    return this.userService.create(dto);
  }
}
