import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class AchievementSummary {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ description: 'Number of users who started the achievement' })
  @IsNumber()
  started: number;

  @ApiProperty({ description: 'Number of users who unlocked the achievement' })
  @IsNumber()
  unlocked: number;

  @ApiProperty({ description: 'Total progress across all players' })
  @IsNumber()
  progress: number;
}
