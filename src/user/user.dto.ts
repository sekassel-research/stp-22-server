import { ApiProperty } from '@nestjs/swagger';

export interface UserToken {
  sub: string; // user id
  preferred_username: string;
  name: string; // full name
  given_name: string; // first name
  family_name: string; // last name
  email: string;
}

export class User {
  @ApiProperty()
  name: string;

  @ApiProperty()
  id: string;
}
