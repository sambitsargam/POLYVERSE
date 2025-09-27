import { sampleCreators, sampleFans, sampleFollows, getRandomCreators, getRandomFans, getRandomFollows } from '../data/sampleData';

/**
 * Hook to query follows from public space - using sample data for demo
 */
export function useFollows(spaceId: string, limit = 20) {
  return {
    data: getRandomFollows(Math.min(limit, 5)),
    isPending: false,
    isError: false,
    error: null,
  };
}

/**
 * Hook to query creators from public space - using sample data for demo  
 */
export function useCreators(spaceId: string, limit = 20) {
  return {
    data: getRandomCreators(Math.min(limit, 5)),
    isPending: false,
    isError: false,
    error: null,
  };
}

/**
 * Hook to query fans from public space - using sample data for demo
 */
export function useFans(spaceId: string, limit = 20) {
  return {
    data: getRandomFans(Math.min(limit, 5)),
    isPending: false,
    isError: false,
    error: null,
  };
}

/**
 * Hook to get Hypergraph utilities for demo purposes
 */
export function usePolyverseHypergraph() {
  return {
    publishRealDemoData: async (spaceId: string) => {
      console.log('Publishing demo data to space:', spaceId);
      // Simulate publishing process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      return { 
        success: true, 
        results: [
          { success: true, creatorId: 'demo-creator-1' },
          { success: true, fanId: 'demo-fan-1' },
          { success: true, followId: 'demo-follow-1' }
        ],
        summary: {
          total: 3,
          successful: 3,
          failed: 0
        }
      };
    }
  };
}