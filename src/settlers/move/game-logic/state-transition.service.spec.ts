import { Test, TestingModule } from '@nestjs/testing';
import { StateTransitionService } from './state-transition.service';

describe('StateTransitionService', () => {
  let service: StateTransitionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StateTransitionService],
    }).compile();

    service = module.get<StateTransitionService>(StateTransitionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
