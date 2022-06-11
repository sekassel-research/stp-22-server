import { OmitType, PartialType } from '@nestjs/swagger';
import { Vote } from './vote.schema';

export class CreateVoteDto extends OmitType(Vote, [
  'mapId',
  'userId',
  'createdAt',
  'updatedAt',
] as const) {
}

export class UpdateVoteDto extends PartialType(CreateVoteDto) {
}
