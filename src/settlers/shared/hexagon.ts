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

export function cubeRing(center: Point3D, radius: number): Point3D[] {
  const results: Point3D[] = [];
  let cube = cubeAdd(center, cubeScale(cubeDirection(4), radius));
  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < radius; j++) {
      results.push(cube);
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

export const CORNER_SIDES = [0, 6] as const;
export type CornerSide = (typeof CORNER_SIDES)[number];

export const EDGE_SIDES = [3, 7, 11] as const;
export type EdgeSide = (typeof EDGE_SIDES)[number];

export const SIDES = [...CORNER_SIDES, ...EDGE_SIDES] as const;
export type Side = CornerSide | EdgeSide;

export type Point3DWithCornerSide = Point3D & { side: CornerSide };
export type Point3DWithEdgeSide = Point3D & { side: EdgeSide };

export const CUBE_CORNERS = [
  [+0, +0, +0, 0], // top
  [+1, +0, -1, 6], // top right
  [+1, -1, +1, 0], // bottom right
  [+0, +0, +0, 6], // bottom
  [-1, +0, +1, 0], // bottom left
  [+0, +1, -1, 6], // top left
] as const;

export function cubeCorners({ x, y, z }: Point3D): Point3DWithCornerSide[] {
  return CUBE_CORNERS.map(([dx, dy, dz, side]) => ({
    x: x + dx,
    y: y + dy,
    z: z + dz,
    side,
  }));
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
  return CORNER_ADJACENT_CUBES[side].map(([dx, dy, dz]) => ({
    x: x + dx,
    y: y + dy,
    z: z + dz,
  }));
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
};

export function edgeAdjacentCubes({ x, y, z, side }: Point3DWithEdgeSide): Point3D[] {
  return EDGE_ADJACENT_CUBES[side].map(([dx, dy, dz]) => ({
    x: x + dx,
    y: y + dy,
    z: z + dz,
  }));
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
  return CORNER_ADJACENT_CORNERS[side].map(([dx, dy, dz, side]) => ({
    x: x + dx,
    y: y + dy,
    z: z + dz,
    side,
  }));
}
