import { Injectable, NestMiddleware } from '@nestjs/common';
import { Response } from 'express';
import { ExtendedRequest } from './auth.interface';
import { AuthService } from './auth.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware<ExtendedRequest, Response> {
  constructor(
    private authService: AuthService,
  ) {
  }

  use(req: ExtendedRequest, res: Response, next: () => void): any {
    const authHeader = (req.headers.authorization || '');
    const token = this.authService.getTokenFromAuthHeader(authHeader);
    req.user = this.authService.parseToken(token);

    next();
  }
}
