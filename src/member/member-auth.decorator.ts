import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiForbiddenResponse } from '@nestjs/swagger';
import { Auth } from 'src/auth/auth.decorator';
import { MemberAuthGuard } from './member-auth.guard';

export function MemberAuth() {
  return applyDecorators(
    Auth(),
    ApiForbiddenResponse({ description: 'Not a member of this game.' }),
    UseGuards(MemberAuthGuard),
  );
}
