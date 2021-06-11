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

export const TILE_TYPES = ['desert', ...RESOURCE_TILE_TYPES] as const;
export type TileType = (typeof TILE_TYPES)[number];

const COMMON_NUMBER_TOKENS = [3, 4, 5, 6, 8, 9, 10, 11] as const;
export const WEIGHTED_NUMBER_TOKENS = [
  2, ...COMMON_NUMBER_TOKENS, ...COMMON_NUMBER_TOKENS, 12,
] as const;
