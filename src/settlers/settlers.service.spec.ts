import { Test, TestingModule } from '@nestjs/testing';
import { SettlersService } from './settlers.service';

describe('SettlersService', () => {
  let service: SettlersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SettlersService],
    }).compile();

    service = module.get<SettlersService>(SettlersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
