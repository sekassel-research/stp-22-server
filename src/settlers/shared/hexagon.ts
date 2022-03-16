import { Point3D } from './schema';

export function Cube(x: number, y: number, z: number): Point3D {
  return { x, y, z };
}

export function cubeAdd(a: Point3D, b: Point3D): Point3D {
  return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
}

export function cubeScale(a: Point3D, b: number): Point3D {
  return { x: a.x * b, y: a.y * b, z: a.z * b };
}

const CUBE_DIRECTIONS = [
  Cube(+1, -1, 0), Cube(+1, 0, -1), Cube(0, +1, -1),
  Cube(-1, +1, 0), Cube(-1, 0, +1), Cube(0, -1, +1),
];

export function cubeDirection(index: number) {
  return CUBE_DIRECTIONS[index];
}

export function cubeNeighbor(cube: Point3D, index: number) {
  return cubeAdd(cube, cubeDirection(index));
}

export function cubeRing(center: Point3D, radius: number): Point3DWithAnyEdgeSide[] {
  const results: Point3DWithAnyEdgeSide[] = [];
  let cube = cubeAdd(center, cubeScale(cubeDirection(4), radius));
  for (let i = 0; i < 6; i++) {
    // 7 7 5 5 3 3 1 1 11 11 9 9
    const side = (18 - i * 2) % 12 + 1 as AnyEdgeSide;
    for (let j = 0; j < radius; j++) {
      results.push({ ...cube, side });
      cube = cubeNeighbor(cube, i);
    }
  }
  return results;
}

export function cubeCircle(radius: number): Point3D[] {
  const results: Point3D[] = [];
  for (let x = -radius; x <= radius; x++) {
    const yMin = Math.max(-radius, -x - radius);
    const yMax = Math.min(radius, -x + radius);
    for (let y = yMin; y <= yMax; y++) {
      const z = -x - y;
      results.push({ x, y, z });
    }
  }
  return results;
}

export function normalizeEdge(point: Point3D, side: AnyEdgeSide): Point3DWithEdgeSide {
  switch (side) {
    case 1:
      return { ...cubeAdd(point, cubeDirection(0)), side: 7 };
    case 5:
      return { ...cubeAdd(point, cubeDirection(2)), side: 11 };
    case 9:
      return { ...cubeAdd(point, cubeDirection(4)), side: 3 };
    default:
      return {...point, side};
  }
}

export const CORNER_SIDES = [0, 6] as const;
export type CornerSide = (typeof CORNER_SIDES)[number];

export const EDGE_SIDES = [3, 7, 11] as const;
export type EdgeSide = (typeof EDGE_SIDES)[number];

export const ALL_EDGE_SIDES = [1, 3, 5, 7, 9, 11] as const;
export type AnyEdgeSide = (typeof ALL_EDGE_SIDES)[number];

export const SIDES = [...CORNER_SIDES, ...EDGE_SIDES] as const;
export type Side = CornerSide | EdgeSide;

export type Point3DWithCornerSide = Point3D & { side: CornerSide };
export type Point3DWithEdgeSide = Point3D & { side: EdgeSide };
export type Point3DWithAnyEdgeSide = Point3D & { side: AnyEdgeSide };

export const CUBE_CORNERS = [
  [+0, +0, +0, 0], // top
  [+1, +0, -1, 6], // top right
  [+1, -1, +1, 0], // bottom right
  [+0, +0, +0, 6], // bottom
  [-1, +0, +1, 0], // bottom left
  [+0, +1, -1, 6], // top left
] as const;

export function cubeCorners({ x, y, z }: Point3D): Point3DWithCornerSide[] {
  return mapSidedPoints(CUBE_CORNERS, x, y, z);
}

export const CORNER_ADJACENT_CUBES = {
  0: [
    [+0, +0, +0],
    [+0, +1, -1],
    [+1, +0, -1],
  ],
  6: [
    [+0, +0, +0],
    [-1, +0, +1],
    [+0, -1, +1],
  ],
} as const;

export function cornerAdjacentCubes({ x, y, z, side }: Point3DWithCornerSide): Point3D[] {
  return mapPoints(CORNER_ADJACENT_CUBES[side], x, y, z);
}

export const EDGE_ADJACENT_CUBES = {
  11: [
    [+0, +0, +0],
    [+0, +1, -1],
  ],
  7: [
    [+0, +0, +0],
    [-1, +0, +1],
  ],
  3: [
    [+0, +0, +0],
    [+1, -1, +0],
  ],
} as const;

export function edgeAdjacentCubes({ x, y, z, side }: Point3DWithEdgeSide): Point3D[] {
  return mapPoints(EDGE_ADJACENT_CUBES[side], x, y, z);
}

export const CORNER_ADJACENT_CORNERS = {
  0: [
    [+0, +1, -1, 6], // left
    [+1, +0, -
      1, 6,
    ], // right
    [+1, +1, -2, 6], // top
  ],
  6: [
    [-1, +0, +1, 0], // left
    [+0, -1, +1, 0], // right
    [-1, -1, +2, 0], // bottom
  ],
} as const;

export function cornerAdjacentCorners({ x, y, z, side }: Point3DWithCornerSide): (Point3DWithCornerSide)[] {
  return mapSidedPoints(CORNER_ADJACENT_CORNERS[side], x, y, z);
}

export const CORNER_ADJACENT_EDGES = {
  0: [
    [+0, +1, -1, 3], // top
    [+1, +0, -1, 7], // right
    [+0, +0, +0, 11], // left
  ],
  6: [
    [+0, -1, +1, 11], // right
    [-1, +0, +1, 3], // bottom
    [+0, +0, +0, 7], // left
  ],
} as const;

export function cornerAdjacentEdges({ x, y, z, side}: Point3DWithCornerSide): Point3DWithEdgeSide[] {
  return mapSidedPoints(CORNER_ADJACENT_EDGES[side], x, y, z);
}

export const EDGE_ADJACENT_CORNERS = {
  3: [
    [+1, +0, -1, 6],
    [+0, -1, +1, 0],
  ],
  7: [
    [-1, +0, +1, 0],
    [+0, +0, +0, 6],
  ],
  11: [
    [+0, +1, -1, 6],
    [+0, +0, +0, 0],
  ],
} as const;

export function edgeAdjacentCorners({ x, y, z, side }: Point3DWithEdgeSide): Point3DWithCornerSide[] {
  return mapSidedPoints(EDGE_ADJACENT_CORNERS[side], x, y, z);
}

export const EDGE_ADJACENT_EDGES = {
  3: [
    [+1, +0, -1, 7], // top left
    [+1, -1, +0, 11], // top right
    [+1, -1, +0, 7], // bottom right
    [+0, -1, +1, 11], // bottom left
  ],
  7: [
    [-1, +1, +0, 3], // top
    [+0, -1, +1, 11], // right
    [-1, +0, +1, 3], // bottom
    [-1, +0, +1, 11], // left
  ],
  11: [
    [+0, +1, -1, 3], // top
    [+1, +0, -1, 7], // right
    [-1, +1, +0, 3], // bottom
    [+0, +1, -1, 7], // left
  ],
} as const;

export function edgeAdjacentEdges({ x, y, z, side }: Point3DWithEdgeSide): Point3DWithEdgeSide[] {
  return mapSidedPoints(EDGE_ADJACENT_EDGES[side], x, y, z);
}

function mapPoints(array: readonly (readonly [number, number, number])[], x: number, y: number, z: number): Point3D[] {
  return array.map(([dx, dy, dz]) => ({
    x: x + dx,
    y: y + dy,
    z: z + dz,
  }));
}

function mapSidedPoints<SIDE>(array: readonly (readonly [number, number, number, SIDE])[], x: number, y: number, z: number): (Point3D & {side: SIDE})[] {
  return array.map(([dx, dy, dz, side]) => ({
    x: x + dx,
    y: y + dy,
    z: z + dz,
    side,
  }));
}
