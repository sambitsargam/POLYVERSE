'use client';

import React, { useState, useEffect } from 'react';
import { mapping } from './mapping';

// POLYVERSE App ID for Hypergraph
const POLYVERSE_APP_ID = 'polyverse-creator-platform';

interface PolyverseHypergraphProviderProps {
  children: React.ReactNode;
}

/**
 * POLYVERSE Hypergraph Provider
 * 
 * This provider wraps the application with Hypergraph capabilities,
 * enabling local-first data storage with sync to the knowledge graph.
 */
export function PolyverseHypergraphProvider({ children }: PolyverseHypergraphProviderProps) {
  const [HypergraphAppProvider, setHypergraphAppProvider] = useState<any>(null);
  const [isClient, setIsClient] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    // Only load Hypergraph on the client side to avoid SSR issues
    setIsClient(true);
    
    const loadHypergraph = async () => {
      try {
        console.log('Loading Hypergraph provider...');
        console.log('Mapping available:', !!mapping);
        console.log('Mapping keys:', Object.keys(mapping));
        
        const { HypergraphAppProvider: Provider } = await import('@graphprotocol/hypergraph-react');
        console.log('Hypergraph provider loaded successfully');
        setHypergraphAppProvider(() => Provider);
      } catch (error) {
        console.error('Failed to load Hypergraph provider:', error);
        setLoadError(error instanceof Error ? error.message : 'Unknown error');
      }
    };

    loadHypergraph();
  }, []);

  // Return children without Hypergraph provider during SSR
  if (!isClient) {
    return <>{children}</>;
  }

  // Show error state if Hypergraph failed to load
  if (loadError) {
    console.error('Hypergraph load error:', loadError);
    return <>{children}</>; // Fallback to children without Hypergraph
  }

  // Return children while loading
  if (!HypergraphAppProvider) {
    return <>{children}</>;
  }

  console.log('Rendering HypergraphAppProvider with mapping:', mapping);

  return (
    <HypergraphAppProvider
      appId={POLYVERSE_APP_ID}
      mapping={mapping}
      config={{
        environment: 'testnet',
        debug: true,
      }}
    >
      {children}
    </HypergraphAppProvider>
  );
}