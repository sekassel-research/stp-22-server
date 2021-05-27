import { Controller, Get } from '@nestjs/common';
import { User } from '../auth/auth.interface';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(
    private userService: UserService,
  ) {
  }

  @Get()
  async getUsers(): Promise<User[]> {
    return this.userService.getOnlineUsers();
  }
}
