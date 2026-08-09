export const TRAVEL_STYLES = [
  'FOOD_EXPLORER',
  'SLOW_TRAVEL',
  'NATURE',
  'CULTURE_ART',
  'ACTIVITY',
  'NIGHTLIFE',
  'SHOPPING',
  'PHOTO',
  'SOLO',
  'FAMILY',
] as const;

export type TravelStyle = (typeof TRAVEL_STYLES)[number];

export function isTravelStyle(value: string): value is TravelStyle {
  return (TRAVEL_STYLES as readonly string[]).includes(value);
}

export function normalizeTravelStyles(
  values: readonly string[],
): TravelStyle[] {
  return values.filter(isTravelStyle);
}
