import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { UserController } from './user.controller';
import { UserGateway } from './user.gateway';
import { UserService } from './user.service';

@Module({
  imports: [AuthModule],
  providers: [UserService, UserGateway],
  controllers: [UserController],
})
export class UserModule {
}
