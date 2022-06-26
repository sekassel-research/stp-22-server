import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { EventModule } from '../event/event.module';
import { UserModule } from '../user/user.module';
import { AchievementController } from './achievement.controller';
import { AchievementHandler } from './achievement.handler';
import { AchievementSchema } from './achievement.schema';
import { AchievementService } from './achievement.service';

@Module({
  imports: [
    MongooseModule.forFeature([{
      name: 'achievements',
      schema: AchievementSchema,
    }]),
    UserModule,
    EventModule,
  ],
  controllers: [AchievementController],
  providers: [AchievementService, AchievementHandler],
  exports: [AchievementService],
})
export class AchievementModule {
}
