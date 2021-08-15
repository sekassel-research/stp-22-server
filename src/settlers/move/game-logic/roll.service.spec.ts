import { Test, TestingModule } from '@nestjs/testing';
import { RollService } from './roll.service';

describe('RollService', () => {
  let service: RollService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RollService],
    }).compile();

    service = module.get<RollService>(RollService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
