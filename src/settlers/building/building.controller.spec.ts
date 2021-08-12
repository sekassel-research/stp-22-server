import { Test, TestingModule } from '@nestjs/testing';
import { BuildingController } from './building.controller';

describe('MapController', () => {
  let controller: BuildingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BuildingController],
    }).compile();

    controller = module.get<BuildingController>(BuildingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
