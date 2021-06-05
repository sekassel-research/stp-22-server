import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
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
import { Auth, AuthUser } from '../auth/auth.decorator';
import { NotFound } from '../util/not-found.decorator';
import { Throttled } from '../util/throttled.decorator';
import { Validated } from '../util/validated.decorator';
import { CreateUserDto, LoginDto, LoginResult, RefreshDto } from './user.dto';
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

  @Post('login')
  @ApiOperation({ description: 'Log in with user credentials.' })
  @ApiCreatedResponse({ type: LoginResult })
  @ApiUnauthorizedResponse({ description: 'Invalid username or password' })
  async login(@Body() dto: LoginDto): Promise<LoginResult> {
    const token = await this.userService.login(dto);
    if (!token) {
      throw new UnauthorizedException('Invalid username or password');
    }
    return token;
  }

  @Post('refresh')
  @ApiOperation({ description: 'Log in with a refresh token.' })
  @ApiCreatedResponse({ type: LoginResult })
  @ApiUnauthorizedResponse({ description: 'Invalid or expired refresh token' })
  async refresh(@Body() dto: RefreshDto): Promise<LoginResult> {
    const token = await this.userService.refresh(dto);
    if (!token) {
      throw new UnauthorizedException('Invalid or expired refresh token.');
    }
    return token;
  }

  @Post('logout')
  @Auth()
  @ApiOperation({ description: 'Sets the current user offline.' })
  @ApiOkResponse()
  async logout(@AuthUser() user: User): Promise<void> {
    return this.userService.logout(user);
  }
}
