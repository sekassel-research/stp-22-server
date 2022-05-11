import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthModule } from '../auth/auth.module';
import { EventModule } from '../event/event.module';
import { AuthController } from './auth.controller';
import { UserController } from './user.controller';
import { UserScheduler } from './user.scheduler';
import { UserSchema } from './user.schema';
import { UserService } from './user.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'users',
        schema: UserSchema,
      },
    ]),
    AuthModule,
    EventModule,
  ],
  providers: [UserService, UserScheduler],
  controllers: [AuthController, UserController],
})
export class UserModule {
}
