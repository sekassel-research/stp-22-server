import { Module } from '@nestjs/common';
import { AchievementModule } from '../achievement/achievement.module';
import { AchievementSummaryController } from './achievement-summary.controller';

@Module({
  imports: [AchievementModule],
  controllers: [AchievementSummaryController],
})
export class AchievementSummaryModule {
}
