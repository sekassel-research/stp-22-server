import { Test, TestingModule } from '@nestjs/testing';
import { MoveController } from './move.controller';

describe('MoveController', () => {
  let controller: MoveController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MoveController],
    }).compile();

    controller = module.get<MoveController>(MoveController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
