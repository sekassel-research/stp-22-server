import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Schema, Types } from 'mongoose';
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
    const date = new Date(payload.iat * 1000);
    return {
      _id: new Types.ObjectId(payload.sub),
      name: payload.preferred_username,
      createdAt: date,
      updatedAt: date,
      passwordHash: '',
      status: 'online',
      friends: [],
    };
  }

  async generate(user: User): Promise<Partial<UserToken>> {
    return { sub: user._id.toString(), preferred_username: user.name };
  }
}
