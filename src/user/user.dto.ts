import { ApiProperty, OmitType, PartialType, PickType } from '@nestjs/swagger';
import { IsByteLength, IsJWT, IsNotEmpty, IsString } from 'class-validator';
import { environment } from '../environment';
import { User } from './user.schema';

class UserAndPassword extends PickType(User, [
  'name',
  'avatar',
  'status',
]) {
  @IsString()
  @IsNotEmpty()
  @IsByteLength(8, undefined, { message: 'Password must be at least 8 characters' })
  @ApiProperty({ minLength: 8 })
  password: string;
}

export class CreateUserDto extends OmitType(UserAndPassword, ['status'] as const) {
}

export class UpdateUserDto extends PartialType(UserAndPassword) {
}

export class LoginDto extends PickType(UserAndPassword, ['name', 'password']) {
}

export class RefreshDto {
  @ApiProperty({ format: 'jwt' })
  @IsJWT()
  refreshToken: string;
}

export class LoginResult extends User {
  @ApiProperty({
    format: 'jwt',
    description: `Token for use with Bearer Authorization. Expires after ${environment.auth.expiry}.`,
  })
  accessToken: string;

  @ApiProperty({
    format: 'jwt',
    description: `Token for use with the \`POST /api/${environment.version}/auth/refresh\` endpoint. Expires after ${environment.auth.refreshExpiry}.`
  })
  refreshToken: string;
}
