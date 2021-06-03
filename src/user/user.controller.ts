import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Request,
  UnauthorizedException,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Auth } from '../auth/auth.decorator';
import { NotFound } from '../util/not-found.decorator';
import { CreateUserDto, LoginDto } from './user.dto';
import { User } from './user.schema';
import { UserService } from './user.service';

@Controller('users')
@ApiTags('Users')
@UsePipes(ValidationPipe)
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

  @Post('login')
  @ApiOperation({ description: 'Log in with user credentials and receive a JSON Web Token.' })
  @ApiCreatedResponse({ type: String })
  @ApiUnauthorizedResponse({ description: 'Invalid username or password' })
  async login(@Body() dto: LoginDto): Promise<string> {
    const token = await this.userService.login(dto);
    if (!token) {
      throw new UnauthorizedException('Invalid username or password');
    }
    return token;
  }

  @Post('logout')
  @Auth()
  @ApiOperation({ description: 'Sets the current user offline.' })
  @ApiOkResponse()
  async logout(@Request() { user }: { user: User }): Promise<void> {
    return this.userService.logout(user);
  }
}
