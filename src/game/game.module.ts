import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GameController } from './game.controller';
import { GameSchema } from './game.schema';
import { GameService } from './game.service';

@Module({
  imports: [
    MongooseModule.forFeature([{
      name: 'games',
      schema: GameSchema,
    }]),
  ],
  controllers: [GameController],
  providers: [GameService],
})
export class GameModule {
}
