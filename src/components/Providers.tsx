'use client'

import { WalletProvider } from '@/components/WalletProvider'
import { UserProvider } from '@/contexts/UserContext'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WalletProvider>
      <UserProvider>
        {children}
      </UserProvider>
    </WalletProvider>
  )
}