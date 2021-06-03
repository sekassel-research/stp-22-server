import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsByteLength, IsNotEmpty, IsString } from 'class-validator';
import { User } from './user.schema';

class UsernameAndPassword extends PickType(User, [
  'name',
]) {
  @IsString()
  @IsNotEmpty()
  @IsByteLength(8, undefined, { message: 'Password must be at least 8 characters' })
  @ApiProperty({ description: 'The login password. Must be at least 8 characters.' })
  password: string;
}

export class CreateUserDto extends UsernameAndPassword {
}

export class LoginDto extends UsernameAndPassword {
}
