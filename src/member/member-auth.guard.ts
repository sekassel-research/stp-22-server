import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { User } from '../user/user.schema';
import { MemberService } from './member.service';

@Injectable()
export class MemberAuthGuard implements CanActivate {
  constructor(
    private memberService: MemberService,
  ) {
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest() as Request;
    const id = req.params.gameId;
    const user = (req as any).user;
    return this.checkAuth(id, user);
  }

  async checkAuth(id: string, user: User): Promise<boolean> {
    return !!await this.memberService.findOne(id, user._id);
  }
}
