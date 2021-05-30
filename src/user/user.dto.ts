import { ApiProperty } from '@nestjs/swagger';

export class User {
  @ApiProperty()
  name: string;

  @ApiProperty({ format: 'uuid' })
  id: string;
}
