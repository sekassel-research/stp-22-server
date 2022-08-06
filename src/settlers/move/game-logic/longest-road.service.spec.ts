import { Test, TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';
import { Building } from '../../building/building.schema';
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
      // Just a single road
      longestRoad: 1,
      roads: [
        {
          'x': 0,
          'y': 0,
          'z': 0,
          'side': 11,
        },
      ],
    },
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
    {
      longestRoad: 6,
      roads: [
        {
          'x': -1,
          'y': 1,
          'z': 0,
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
          'side': 7,
        },
        {
          'x': 0,
          'y': 0,
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
    const buildings: Building[] = roads.map(r => ({ _id: new Types.ObjectId(), owner: 'a', gameId: 'g1', type: 'road', ...r }));
    for (const road of buildings) {
      it(`should find the longest road of length ${longestRoad} in example ${i} starting at ${JSON.stringify(road)}`, () => {
        expect(service.findLongestRoad(buildings, 'a')).toEqual(longestRoad);
      });
    }
  }
});
