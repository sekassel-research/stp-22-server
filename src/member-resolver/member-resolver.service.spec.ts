import { Test, TestingModule } from '@nestjs/testing';
import { MemberResolverService } from './member-resolver.service';

describe('MemberResolverService', () => {
  let service: MemberResolverService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MemberResolverService],
    }).compile();

    service = module.get<MemberResolverService>(MemberResolverService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
