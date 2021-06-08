import { ApiProperty, PartialType, PickType } from '@nestjs/swagger';
import { IsByteLength, IsNotEmpty, IsString } from 'class-validator';
import { User } from './user.schema';

class UserAndPassword extends PickType(User, [
  'name',
  'avatar',
]) {
  @IsString()
  @IsNotEmpty()
  @IsByteLength(8, undefined, { message: 'Password must be at least 8 characters' })
  @ApiProperty({ minLength: 8 })
  password: string;
}

export class CreateUserDto extends UserAndPassword {
}

export class UpdateUserDto extends PartialType(UserAndPassword) {
}

export class LoginDto extends PickType(UserAndPassword, ['name', 'password']) {
}

export class RefreshDto {
  @ApiProperty({ format: 'jwt' })
  refreshToken: string;
}

export class LoginResult extends User {
  @ApiProperty({ format: 'jwt' })
  accessToken: string;

  @ApiProperty({ format: 'jwt' })
  refreshToken: string;
}
