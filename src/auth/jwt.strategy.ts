import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { environment } from '../environment';
import { User } from '../user/user.dto';
import { UserToken } from './user-token.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: environment.auth.publicKey,
      algorithms: environment.auth.algorithms,
      issuer: environment.auth.issuer,
    });
  }

  async validate(payload: UserToken): Promise<User> {
    return { id: payload.sub, name: payload.preferred_username };
  }
}
