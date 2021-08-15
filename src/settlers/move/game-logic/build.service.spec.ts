import { Test, TestingModule } from '@nestjs/testing';
import { BuildService } from './build.service';

describe('BuildService', () => {
  let service: BuildService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BuildService],
    }).compile();

    service = module.get<BuildService>(BuildService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
