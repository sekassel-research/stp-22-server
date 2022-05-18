import { ApiPropertyOptional, PartialType, PickType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDate, IsInt, IsOptional, Max, Min } from 'class-validator';
import { Message } from './message.schema';

export class CreateMessageDto extends PickType(Message, [
  'body',
] as const) {
}

export class UpdateMessageDto extends PartialType(PickType(Message, [
  'body',
] as const)) {
}

const MESSAGE_LIMIT = 100;

export class QueryMessagesDto {
  @ApiPropertyOptional({ description: 'Inclusive lower bound for message creation timestamp' })
  @Transform(({ value }) => value ? new Date(value) : undefined)
  @IsOptional()
  @IsDate()
  createdAfter?: Date;

  @ApiPropertyOptional({ description: 'Exclusive upper bound for message creation timestamp' })
  @Transform(({ value }) => value ? new Date(value) : undefined)
  @IsOptional()
  @IsDate()
  createdBefore?: Date;

  @ApiPropertyOptional({
    description: 'The maximum number of results',
    type: 'integer',
    minimum: 1,
    maximum: MESSAGE_LIMIT,
    default: MESSAGE_LIMIT,
  })
  @Transform(({ value }) => value ? +value : undefined)
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(MESSAGE_LIMIT)
  limit?: number;
}
