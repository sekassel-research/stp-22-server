import {CustomDecorator, SetMetadata} from '@nestjs/common';

export function Roles(...roles: string[]): CustomDecorator {
  return SetMetadata('roles', roles);
}
