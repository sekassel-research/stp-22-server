import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { environment } from '../environment';
import { UserController } from './user.controller';
import { UserGateway } from './user.gateway';
import { UserService } from './user.service';

@Module({
  imports: [
    JwtModule.register({
      publicKey: environment.auth.publicKey,
      verifyOptions: {
        algorithms: environment.auth.algorithms as any[],
        issuer: environment.auth.issuer,
      },
    }),
  ],
  providers: [UserService, UserGateway],
  controllers: [UserController],
})
export class UserModule {
}
