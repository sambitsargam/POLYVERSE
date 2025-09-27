import { WalletClient, createWalletClient, http } from 'viem'
import { ethers } from 'ethers'

export function walletClientToSigner(walletClient: WalletClient) {
  return {
    account: walletClient.account,
    transport: walletClient.transport,
    signMessage: walletClient.signMessage,
    signTransaction: walletClient.signTransaction,
    signTypedData: walletClient.signTypedData,
    getAddresses: () => walletClient.getAddresses(),
  }
}

export async function getSigner(walletClient: WalletClient | undefined): Promise<ethers.Signer | null> {
  if (!walletClient?.account || !walletClient.transport) {
    console.error('❌ No wallet client or account available')
    return null
  }

  try {
    console.log('🔄 Creating ethers provider from wallet client...')
    
    // Get the ethereum provider from window.ethereum
    const ethereum = (window as any).ethereum
    if (!ethereum) {
      throw new Error('No ethereum provider found')
    }

    // Create ethers BrowserProvider from the ethereum provider (ethers v6)
    const provider = new ethers.BrowserProvider(ethereum)
    console.log('✅ Created ethers provider')

    // Get the signer from the provider
    const signer = await provider.getSigner()
    console.log('✅ Created ethers signer:', await signer.getAddress())

    return signer
  } catch (error) {
    console.error('❌ Error creating signer:', error)
    throw new Error(`Failed to create signer: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export async function getEthersSigner(walletClient: WalletClient | undefined): Promise<ethers.Signer | null> {
  return getSigner(walletClient)
}