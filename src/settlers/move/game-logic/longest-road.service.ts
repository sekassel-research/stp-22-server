import { Injectable } from '@nestjs/common';
import { Building } from '../../building/building.schema';
import { cornerAdjacentEdges, edgeAdjacentCorners, Point3DWithEdgeSide } from '../../shared/hexagon';
import { Point3D } from '../../shared/schema';

@Injectable()
export class LongestRoadService {
  findLongestRoad(buildings: Building[], player: string): number {
    // from https://stackoverflow.com/a/47573447/4138801

    let longestRoad = 0;

    function checkIfLongestRoad(roadLength: number) {
      if (roadLength > longestRoad) {
        longestRoad = roadLength;
      }
    }

    const mainLoop = (currentLongestRoad: number, tileEdge: Point3DWithEdgeSide, passedCorners: Set<string>, passedEdges: Set<string>) => {
      const tileEdgeId = this.id(tileEdge);
      if (!passedEdges.has(tileEdgeId) && this.owner(tileEdge, buildings) === player) {
        passedEdges.add(tileEdgeId);
        currentLongestRoad++;
        for (const corner of edgeAdjacentCorners(tileEdge)) {
          const cornerOwner = this.owner(corner, buildings);
          const cornerId = this.id(corner);
          if ((cornerOwner === player || !cornerOwner) && !passedCorners.has(cornerId)) {
            passedCorners.add(cornerId);
            for (const edge of cornerAdjacentEdges(corner)) {
              if (!this.equal(edge, tileEdge)) {
                mainLoop(currentLongestRoad, edge, passedCorners, passedEdges);
              }
            }
          } else {
            checkIfLongestRoad(currentLongestRoad);
          }
        }
      } else {
        checkIfLongestRoad(currentLongestRoad);
      }
    };

    for (const building of buildings) {
      if (building.type === 'road' && building.owner === player) {
        // TODO this may be inefficient - it starts from every road instead of endpoints only
        mainLoop(0, building as Point3DWithEdgeSide, new Set(), new Set());
      }
    }

    return longestRoad;
  }

  private owner(a: Point3D & { side: number }, buildings: Building[]): string | undefined {
    for (const building of buildings) {
      if (this.equal(building, a)) {
        return building.owner;
      }
    }
    return undefined;
  }

  private equal(a: Point3D & { side: number }, b: Point3D & { side: number }): boolean {
    return a.x === b.x && a.y === b.y && a.z === b.z && a.side === b.side;
  }

  private id(a: Point3D & { side: number }): string {
    return `${a.x},${a.y},${a.z},${a.side}`;
  }
}
