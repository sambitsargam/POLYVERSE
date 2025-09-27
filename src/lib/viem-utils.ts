import { WalletClient } from 'viem'

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

export async function getSigner(walletClient: WalletClient | undefined) {
  if (!walletClient) {
    throw new Error('No wallet client available')
  }

  return walletClientToSigner(walletClient)
}