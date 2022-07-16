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

  const cases: { roads: Point3DWithEdgeSide[], longestRoad: number }[] = [
    {
      // Example setup from https://jira.uniks.de/browse/STP22SRV-31 comments
      longestRoad: 5,
      roads: [
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
      ],
    },
    {
      // Example setup from https://jira.uniks.de/browse/STP22SRV-31 description
      longestRoad: 5,
      roads: [
        {
          'x': 0,
          'y': -1,
          'z': 1,
          'side': 3,
        },
        {
          'x': 0,
          'y': -1,
          'z': 1,
          'side': 11,
        },
        {
          'x': 0,
          'y': 0,
          'z': 0,
          'side': 3,
        },
        {
          'x': 0,
          'y': 0,
          'z': 0,
          'side': 11,
        },
        {
          'x': 1,
          'y': -1,
          'z': 0,
          'side': 7,
        },
        {
          'x': 1,
          'y': -1,
          'z': 0,
          'side': 11,
        },
        {
          'x': 1,
          'y': 0,
          'z': -1,
          'side': 7,
        },
      ],
    },
  ];

  for (let i = 0; i < cases.length; i++) {
    const { roads, longestRoad } = cases[i];
    for (const road of roads) {
      it(`should find the longest road of length ${longestRoad} in example ${i} starting at ${JSON.stringify(road)}`, () => {
        expect(service.findLongestRoad(roads, road)).toEqual(longestRoad);
      });
    }
  }
});
