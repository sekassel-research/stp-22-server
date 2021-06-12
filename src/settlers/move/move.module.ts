import { Module } from '@nestjs/common';
import { StateModule } from '../state/state.module';
import { MoveController } from './move.controller';
import { MoveService } from './move.service';

@Module({
  imports: [StateModule],
  controllers: [MoveController],
  providers: [MoveService]
})
export class MoveModule {}
