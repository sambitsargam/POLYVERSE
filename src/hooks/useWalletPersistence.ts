'use client';

import { useEffect } from 'react';
import { useAccount, useDisconnect } from 'wagmi';

export function useWalletPersistence() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  // Save wallet state to localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const walletState = {
      address,
      isConnected,
      timestamp: Date.now(),
    };

    if (isConnected && address) {
      localStorage.setItem('polyverse_wallet_state', JSON.stringify(walletState));
      console.log('💾 Saved wallet state:', walletState);
    }
  }, [address, isConnected]);

  // Handle page visibility changes (tab switches)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('👀 Tab became visible');
        
        // Check if wallet state is consistent
        const savedState = localStorage.getItem('polyverse_wallet_state');
        if (savedState) {
          try {
            const parsed = JSON.parse(savedState);
            const isRecent = Date.now() - parsed.timestamp < 30 * 60 * 1000; // 30 minutes
            
            console.log('🔍 Checking wallet state consistency:', {
              savedConnected: parsed.isConnected,
              currentConnected: isConnected,
              savedAddress: parsed.address,
              currentAddress: address,
              isRecent
            });

            // If there's a mismatch and saved state is recent, something went wrong
            if (isRecent && parsed.isConnected && parsed.address && !isConnected) {
              console.log('⚠️ Wallet state mismatch detected - wallet may have disconnected unexpectedly');
              // Don't auto-reconnect, but preserve user profile
            }
          } catch (error) {
            console.error('Error checking wallet state:', error);
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [address, isConnected]);

  // Clean up old wallet state on unmount
  useEffect(() => {
    return () => {
      // Don't clear on unmount - only clear on explicit disconnect
    };
  }, []);
}