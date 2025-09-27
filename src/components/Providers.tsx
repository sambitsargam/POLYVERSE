'use client'

import { WalletProvider } from '@/components/WalletProvider'
import { UserProvider } from '@/contexts/UserContext'
import { PolyverseHypergraphProvider } from '@/hypergraph/provider'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WalletProvider>
      <UserProvider>
        <PolyverseHypergraphProvider>
          {children}
        </PolyverseHypergraphProvider>
      </UserProvider>
    </WalletProvider>
  )
}