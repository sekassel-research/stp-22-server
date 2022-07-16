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

  it('should find the longest road', () => {
    expect(service._findLongestRoad([], {x: 0, y: 0, z: 0, side: 3})).toBeDefined();
  });
});
