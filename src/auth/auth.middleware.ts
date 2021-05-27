import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Response } from 'express';
import { ExtendedRequest } from './auth.interface';
import { AuthService } from './auth.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware<ExtendedRequest, Response> {
  private readonly authSchema = 'Bearer';

  constructor(
    private authService: AuthService,
  ) {
  }

  use(req: ExtendedRequest, res: Response, next: () => void): any {
    const authHeader = (req.headers.authorization || '').split(' ');
    if (authHeader[0] !== this.authSchema) {
      throw new UnauthorizedException(`Unsupported authentication method, use '${this.authSchema}' instead`);
    }

    const token = authHeader[1];
    req.user = this.authService.parseToken(token);

    next();
  }
}
