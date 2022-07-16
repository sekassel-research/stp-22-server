import { Injectable } from '@nestjs/common';
import { edgeAdjacentEdges, Point3DWithEdgeSide } from '../../shared/hexagon';

@Injectable()
export class LongestRoadService {
  /**
   * @param allRoads all roads belonging to the player.
   * @param hint a hint where to start (e.g. the last road placed). Determines the group that will be examined.
   */
  findLongestRoad(allRoads: Point3DWithEdgeSide[], hint: Point3DWithEdgeSide): number {
    // From https://stackoverflow.com/a/3192726/4138801

    // find the local group and neighbor count for each edge in first DFS pass
    const group = new Map<Point3DWithEdgeSide, number>();
    for (const {} of this.dfs(allRoads, hint, new Set(), 0, group)) {
    }
    const groupRoads = [...group.keys()];

    // find all endpoints, or fall back to all roads if looping
    const endpoints = [...group.entries()].filter(([, v]) => v === 1).map(([k]) => k);
    const starts = endpoints.length ? endpoints : groupRoads;

    let longestPath = 0;
    for (const start of starts) {
      for (const path of this.dfs(groupRoads, start, new Set(), 1)) {
        if (path >= longestPath) {
          longestPath = path;
        }
      }
    }

    return longestPath;
  }

  private* dfs(roads: Point3DWithEdgeSide[], current: Point3DWithEdgeSide, seen: Set<Point3DWithEdgeSide>, path: number, allSeen?: Map<Point3DWithEdgeSide, number>): Generator<number> {
    seen.add(current);
    let connected = 0;
    for (const a of edgeAdjacentEdges(current)) {
      const road = roads.find(r => r.x === a.x && r.y === a.y && r.z === a.z && r.side === a.side);
      if (!road || seen.has(road)) {
        continue;
      }

      connected++;
      const newPath = path + 1;
      yield newPath;
      yield* this.dfs(roads, road, new Set(seen), newPath, allSeen);
    }

    allSeen?.set(current, connected);
  }
}
