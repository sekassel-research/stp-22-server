import { Body, Controller, Delete, ForbiddenException, Get, Param, Patch, Post, Query } from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Auth, AuthUser } from '../auth/auth.decorator';
import { NotFound } from '../util/not-found.decorator';
import { Validated } from '../util/validated.decorator';
import { CreateUserDto, UpdateUserDto } from './user.dto';
import { Status, STATUS, User } from './user.schema';
import { UserService } from './user.service';

@Controller('users')
@ApiTags('Users')
@Validated()
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
    name: 'status',
    required: false,
    enum: STATUS,
    description: 'When set, returns only users with this status',
  })
  async getUsers(
    @Query('status') status?: Status,
    @Query('ids') ids?: string,
  ): Promise<User[]> {
    return this.userService.findAll(status, ids?.split(','));
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
