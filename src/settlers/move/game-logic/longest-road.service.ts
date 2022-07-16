import { Injectable } from '@nestjs/common';
import { edgeAdjacentEdges, Point3DWithEdgeSide } from '../../shared/hexagon';

@Injectable()
export class LongestRoadService {
  findLongestRoad(allRoads: Point3DWithEdgeSide[], start: Point3DWithEdgeSide): number {
    let longestPath: Point3DWithEdgeSide[] = [];
    for (const path of this.dfs(allRoads, start, new Set(), [start])) {
      if (path.length >= longestPath.length) {
        longestPath = path;
      }
    }

    return longestPath.length;
  }

  private* dfs(roads: Point3DWithEdgeSide[], current: Point3DWithEdgeSide, seen: Set<Point3DWithEdgeSide>, path: Point3DWithEdgeSide[]): Generator<Point3DWithEdgeSide[]> {
    seen.add(current);
    for (const a of edgeAdjacentEdges(current)) {
      const road = roads.find(r => r.x === a.x && r.y === a.y && r.z === a.z && r.side === a.side);
      if (!road || seen.has(road)) {
        continue;
      }

      const newPath = [...path, road];
      yield newPath;
      yield* this.dfs(roads, road, new Set(seen), newPath);
    }
  }
}
