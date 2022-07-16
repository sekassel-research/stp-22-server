import { Test, TestingModule } from '@nestjs/testing';
import { Point3DWithEdgeSide } from '../../shared/hexagon';
import { LongestRoadService } from './longest-road.service';

describe('LongestRoadService', () => {
  let service: LongestRoadService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LongestRoadService],
    }).compile();

    service = module.get<LongestRoadService>(LongestRoadService);
  });

  // Example setup from https://jira.uniks.de/browse/STP22SRV-31
  const roads: Point3DWithEdgeSide[] = [
    { // endpoint
      'x': -1,
      'y': 0,
      'z': 1,
      'side': 11,
    },
    {
      'x': -1,
      'y': 1,
      'z': 0,
      'side': 3,
    },
    { // endpoint
      'x': -1,
      'y': 1,
      'z': 0,
      'side': 11,
    },
    {
      'x': -1,
      'y': 2,
      'z': -1,
      'side': 3,
    },
    {
      'x': 0,
      'y': 0,
      'z': 0,
      'side': 11,
    },
    {
      'x': 0,
      'y': 1,
      'z': -1,
      'side': 3,
    },
    {
      'x': 0,
      'y': 1,
      'z': -1,
      'side': 7,
    },
    { // endpoint
      'x': 0,
      'y': 1,
      'z': -1,
      'side': 11,
    },
    { // endpoint
      'x': 1,
      'y': 0,
      'z': -1,
      'side': 7,
    },
  ];

  for (const road of roads) {
    it('should find the longest road starting at ' + JSON.stringify(road), () => {
      expect(service.findLongestRoad(roads, road)).toEqual(5);
    });
  }
});
