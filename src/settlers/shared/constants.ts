export const RESOURCE_TYPES = [
  'grain',
  'brick',
  'ore',
  'lumber',
  'wool',
] as const;
export type ResourceType = (typeof RESOURCE_TYPES)[number];

export const RESOURCE_TILE_TYPES = [
  'fields',
  'hills',
  'mountains',
  'forest',
  'pasture',
] as const;
export type ResourceTileType = (typeof RESOURCE_TILE_TYPES)[number];

export const TILE_RESOURCES: Record<ResourceTileType, ResourceType> = {
  fields: 'grain',
  hills: 'brick',
  mountains: 'ore',
  forest: 'lumber',
  pasture: 'wool',
};

export const TILE_TYPES = ['desert', ...RESOURCE_TILE_TYPES] as const;
export type TileType = (typeof TILE_TYPES)[number];

export const BUILDING_TYPES = [
  'settlement',
  'city',
  'road',
] as const;
export type BuildingType = (typeof BUILDING_TYPES)[number];

export const INITIAL_BUILDINGS: Record<BuildingType, number> = {
  city: 4,
  settlement: 5,
  road: 15,
};

export const BUILDING_COSTS: Record<BuildingType, Partial<Record<ResourceType, number>>> = {
  road: {
    lumber: 1,
    brick: 1,
  },
  settlement: {
    grain: 1,
    lumber: 1,
    brick: 1,
    wool: 1,
  },
  city: {
    grain: 2,
    ore: 3,
  },
}

const COMMON_NUMBER_TOKENS = [3, 4, 5, 6, 8, 9, 10, 11] as const;
export const WEIGHTED_NUMBER_TOKENS = [
  2, ...COMMON_NUMBER_TOKENS, ...COMMON_NUMBER_TOKENS, 12,
] as const;

export const TASKS = [
  'founding-roll',
  'founding-settlement-1',
  'founding-settlement-2',
  'founding-road-1',
  'founding-road-2',
  'roll',
  'build',
] as const;
export type Task = (typeof TASKS)[number];
