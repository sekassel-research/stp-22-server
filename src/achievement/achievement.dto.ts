import { PickType } from '@nestjs/swagger';
import { PartialType } from '../util/partial-type';
import { Achievement } from './achievement.schema';

export class CreateAchievementDto extends PickType(Achievement, [
  'progress',
  'unlockedAt',
] as const) {
}

export class UpdateAchievementDto extends PartialType(CreateAchievementDto) {
}
