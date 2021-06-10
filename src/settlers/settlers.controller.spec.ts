import { Test, TestingModule } from '@nestjs/testing';
import { SettlersController } from './settlers.controller';

describe('SettlersController', () => {
  let controller: SettlersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SettlersController],
    }).compile();

    controller = module.get<SettlersController>(SettlersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
