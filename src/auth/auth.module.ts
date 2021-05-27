import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { environment } from '../environment';
import { AuthService } from './auth.service';

@Module({
  imports: [
    JwtModule.register({
      publicKey: environment.auth.publicKey,
    }),
  ],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {
}
