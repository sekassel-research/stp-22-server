import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { environment } from '../environment';
import { User } from '../user/user.schema';
import { UserToken } from './auth.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: environment.auth.secret,
    });
  }

  async validate(payload: UserToken): Promise<User> {
    return {
      _id: payload.sub,
      name: payload.preferred_username,
      status: 'online',
    };
  }

  async generate(user: User): Promise<UserToken> {
    return { sub: user._id, preferred_username: user.name };
  }
}
