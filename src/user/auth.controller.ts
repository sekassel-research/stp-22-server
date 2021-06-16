import { Body, Controller, Post, UnauthorizedException } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { Auth, AuthUser } from '../auth/auth.decorator';
import { Throttled } from '../util/throttled.decorator';
import { Validated } from '../util/validated.decorator';
import { LoginDto, LoginResult, RefreshDto } from './user.dto';
import { User } from './user.schema';
import { UserService } from './user.service';

@Controller('auth')
@ApiTags('Authentication')
@Validated()
@Throttled()
export class AuthController {
  constructor(
    private userService: UserService,
  ) {
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
  @ApiOperation({ description: 'Logs out the current user by invalidating the refresh token.' })
  @ApiOkResponse()
  async logout(@AuthUser() user: User): Promise<void> {
    await this.userService.logout(user);
  }
}
