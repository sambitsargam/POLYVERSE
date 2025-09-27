'use client';

import { useQuery } from '@graphprotocol/hypergraph-react';
import type { Entity } from '@graphprotocol/hypergraph';

/**
 * Enhanced useQuery hook that gracefully handles mapping errors
 */
export function useSafeQuery<const S extends Entity.AnyNoContext>(
  type: S,
  params: {
    mode: 'public' | 'private';
    space: string;
    first?: number;
  }
) {
  try {
    // Always call useQuery to maintain hook order consistency
    const result = useQuery(type, params);
    return result;
  } catch (error) {
    console.error(`Error in useSafeQuery:`, error);
    // Return a consistent error state
    return {
      data: [],
      isPending: false,
      isError: true,
      error: error instanceof Error ? error : new Error(String(error))
    };
  }
}