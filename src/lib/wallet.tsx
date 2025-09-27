// Web3 wallet connection utilities
'use client'

import { useState, useEffect, createContext, useContext } from 'react'

interface WalletState {
  isConnected: boolean
  address: string | null
  chainId: number | null
  balance: string | null
  provider: any | null
}

interface WalletContextType extends WalletState {
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
  signMessage: (message: string) => Promise<string>
  sendTransaction: (transaction: any) => Promise<string>
  switchNetwork: (chainId: number) => Promise<void>
}

const WalletContext = createContext<WalletContextType | null>(null)

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    address: null,
    chainId: null,
    balance: null,
    provider: null
  })

  // Check if wallet is already connected on load
  useEffect(() => {
    checkWalletConnection()
  }, [])

  const checkWalletConnection = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' })
        if (accounts.length > 0) {
          const chainId = await window.ethereum.request({ method: 'eth_chainId' })
          const balance = await window.ethereum.request({
            method: 'eth_getBalance',
            params: [accounts[0], 'latest']
          })
          
          setWalletState({
            isConnected: true,
            address: accounts[0],
            chainId: parseInt(chainId, 16),
            balance: formatEther(balance),
            provider: window.ethereum
          })
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error)
      }
    }
  }

  const connectWallet = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        // Request account access
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        })
        
        if (accounts.length > 0) {
          const chainId = await window.ethereum.request({ method: 'eth_chainId' })
          const balance = await window.ethereum.request({
            method: 'eth_getBalance',
            params: [accounts[0], 'latest']
          })
          
          setWalletState({
            isConnected: true,
            address: accounts[0],
            chainId: parseInt(chainId, 16),
            balance: formatEther(balance),
            provider: window.ethereum
          })
        }
      } catch (error) {
        console.error('Error connecting wallet:', error)
        throw error
      }
    } else {
      throw new Error('MetaMask is not installed')
    }
  }

  const disconnectWallet = () => {
    setWalletState({
      isConnected: false,
      address: null,
      chainId: null,
      balance: null,
      provider: null
    })
  }

  const signMessage = async (message: string): Promise<string> => {
    if (!walletState.provider || !walletState.address) {
      throw new Error('Wallet not connected')
    }

    try {
      const signature = await walletState.provider.request({
        method: 'personal_sign',
        params: [message, walletState.address]
      })
      return signature
    } catch (error) {
      console.error('Error signing message:', error)
      throw error
    }
  }

  const sendTransaction = async (transaction: any): Promise<string> => {
    if (!walletState.provider || !walletState.address) {
      throw new Error('Wallet not connected')
    }

    try {
      const txHash = await walletState.provider.request({
        method: 'eth_sendTransaction',
        params: [{
          from: walletState.address,
          ...transaction
        }]
      })
      return txHash
    } catch (error) {
      console.error('Error sending transaction:', error)
      throw error
    }
  }

  const switchNetwork = async (chainId: number) => {
    if (!walletState.provider) {
      throw new Error('Wallet not connected')
    }

    try {
      await walletState.provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }]
      })
      
      // Update state after network switch
      setWalletState(prev => ({ ...prev, chainId }))
    } catch (error: any) {
      // If network doesn't exist, add it
      if (error.code === 4902) {
        await addNetwork(chainId)
      } else {
        throw error
      }
    }
  }

  const addNetwork = async (chainId: number) => {
    const networkConfigs: Record<number, any> = {
      314159: { // Filecoin Calibration
        chainId: '0x4CB2F',
        chainName: 'Filecoin Calibration',
        nativeCurrency: {
          name: 'FIL',
          symbol: 'FIL',
          decimals: 18
        },
        rpcUrls: ['https://api.calibration.node.glif.io/rpc/v1'],
        blockExplorerUrls: ['https://calibration.filfox.info/']
      },
      314: { // Filecoin Mainnet
        chainId: '0x13A',
        chainName: 'Filecoin',
        nativeCurrency: {
          name: 'FIL',
          symbol: 'FIL',
          decimals: 18
        },
        rpcUrls: ['https://api.node.glif.io/rpc/v1'],
        blockExplorerUrls: ['https://filfox.info/']
      }
    }

    const networkConfig = networkConfigs[chainId]
    if (networkConfig && walletState.provider) {
      await walletState.provider.request({
        method: 'wallet_addEthereumChain',
        params: [networkConfig]
      })
    }
  }

  // Listen to account and network changes
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet()
        } else {
          setWalletState(prev => ({ ...prev, address: accounts[0] }))
        }
      }

      const handleChainChanged = (chainId: string) => {
        setWalletState(prev => ({ ...prev, chainId: parseInt(chainId, 16) }))
      }

      window.ethereum.on('accountsChanged', handleAccountsChanged)
      window.ethereum.on('chainChanged', handleChainChanged)

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
        window.ethereum.removeListener('chainChanged', handleChainChanged)
      }
    }
  }, [])

  return (
    <WalletContext.Provider
      value={{
        ...walletState,
        connectWallet,
        disconnectWallet,
        signMessage,
        sendTransaction,
        switchNetwork
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (!context) {
    throw new Error('useWallet must be used within WalletProvider')
  }
  return context
}

// Utility function to format ether
function formatEther(wei: string): string {
  const ethValue = parseInt(wei, 16) / Math.pow(10, 18)
  return ethValue.toFixed(4)
}

// Network configurations
export const NETWORKS = {
  FILECOIN_MAINNET: 314,
  FILECOIN_CALIBRATION: 314159,
  ETHEREUM_MAINNET: 1,
  POLYGON_MAINNET: 137
}

// Declare global ethereum interface
declare global {
  interface Window {
    ethereum?: any
  }
}