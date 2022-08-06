import { Injectable } from '@nestjs/common';
import { Building } from '../../building/building.schema';
import { edgeAdjacentEdges, Point3DWithEdgeSide } from '../../shared/hexagon';

@Injectable()
export class LongestRoadService {
  /**
   * @param buildings all buildings in the current game.
   * @param hint a hint where to start (e.g. the last road placed). Determines the group that will be examined.
   */
  findLongestRoad(buildings: Building[], hint: Building): number {
    const allRoads = buildings.filter(b => b.type === 'road' && b.owner === hint.owner);
    if (allRoads.length === 1) {
      return 1;
    }

    // From https://stackoverflow.com/a/3192726/4138801

    // find the local group and neighbor count for each edge in first DFS pass
    const group = new Map<Building, number>();
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

  private* dfs(roads: Building[], current: Building, seen: Set<Building>, path: number, allSeen?: Map<Building, number>): Generator<number> {
    seen.add(current);
    const adjacentRoads = edgeAdjacentEdges(current as Point3DWithEdgeSide)
      .flatMap(a => roads.find(r => r.x === a.x && r.y === a.y && r.z === a.z && r.side === a.side) ?? []);
    const newSeen = new Set([...seen, ...adjacentRoads]);
    for (const road of adjacentRoads) {
      if (seen.has(road)) {
        continue;
      }

      const newPath = path + 1;
      yield newPath;
      yield* this.dfs(roads, road, newSeen, newPath, allSeen);
    }

    allSeen?.set(current, adjacentRoads.length);
  }
}
