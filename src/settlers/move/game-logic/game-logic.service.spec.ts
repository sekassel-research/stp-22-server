import { Test, TestingModule } from '@nestjs/testing';
import { GameLogicService } from './game-logic.service';

describe('GameLogicService', () => {
  let service: GameLogicService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GameLogicService],
    }).compile();

    service = module.get<GameLogicService>(GameLogicService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
