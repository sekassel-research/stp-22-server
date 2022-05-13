import { ApiProperty, ApiPropertyOptional, OmitType, PartialType, PickType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsByteLength, IsIn, IsJWT, IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { environment } from '../environment';
import { Status, STATUS, User } from './user.schema';

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
    description: `Token for use with the \`POST /api/${environment.version}/auth/refresh\` endpoint. Expires after ${environment.auth.refreshExpiry}.`,
  })
  refreshToken: string;
}

export class QueryUsersDto {
  @ApiPropertyOptional({
    description: 'A comma-separated list of IDs that should be included in the response.',
  })
  @Transform(({ value }) => Array.isArray(value) ? value : value?.split(','))
  @IsOptional()
  @IsMongoId({ each: true })
  ids?: string[];

  @ApiPropertyOptional({
    enum: STATUS,
    description: 'When set, returns only users with this status',
  })
  @IsOptional()
  @IsIn(STATUS)
  status?: Status;
}
