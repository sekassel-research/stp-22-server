import { Injectable } from '@nestjs/common';
import { edgeAdjacentEdges, Point3DWithEdgeSide } from '../../shared/hexagon';

@Injectable()
export class LongestRoadService {
  findLongestRoad(allRoads: Point3DWithEdgeSide[], start: Point3DWithEdgeSide): number {
    let longestPath = 0;
    for (const path of this.dfs(allRoads, start, new Set(), 1)) {
      if (path >= longestPath) {
        longestPath = path;
      }
    }

    return longestPath;
  }

  private* dfs(roads: Point3DWithEdgeSide[], current: Point3DWithEdgeSide, seen: Set<Point3DWithEdgeSide>, path: number): Generator<number> {
    seen.add(current);
    for (const a of edgeAdjacentEdges(current)) {
      const road = roads.find(r => r.x === a.x && r.y === a.y && r.z === a.z && r.side === a.side);
      if (!road || seen.has(road)) {
        continue;
      }

      const newPath = path + 1;
      yield newPath;
      yield* this.dfs(roads, road, new Set(seen), newPath);
    }
  }
}
