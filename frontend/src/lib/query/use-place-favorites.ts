'use client';

import { useQuery } from '@tanstack/react-query';
import { getPlaceFavorites } from '../api/place-favorites';
import { queryKeys } from './keys';

export function usePlaceFavorites() {
  return useQuery({
    queryKey: queryKeys.placeFavorites,
    queryFn: getPlaceFavorites,
  });
}
