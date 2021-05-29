import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { environment } from '../environment';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';

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
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtModule, JwtStrategy],
})
export class AuthModule {
}
