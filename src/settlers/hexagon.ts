import { Point3D } from './settlers.schema';

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
]

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
