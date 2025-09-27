'use client';

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { config } from '@/lib/wallet-config';

import '@rainbow-me/rainbowkit/styles.css';

// Create a stable query client instance with better persistence
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes - longer cache time
      gcTime: 10 * 60 * 1000, // 10 minutes garbage collection
      retry: 1, // Reduce retries to prevent connection spam
      refetchOnWindowFocus: false, // Don't refetch on tab focus (key fix!)
      refetchOnMount: false, // Don't refetch on component mount
      refetchInterval: false, // Disable auto refetch
    },
  },
});

export function WalletProvider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: '#7c3aed',
            accentColorForeground: 'white',
            borderRadius: 'medium',
          })}
          showRecentTransactions={true}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}