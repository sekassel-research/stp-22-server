import { IsNotEmpty, IsString } from 'class-validator';

export class PutMessageDto {
  @IsString()
  @IsNotEmpty()
  body: string;
}
