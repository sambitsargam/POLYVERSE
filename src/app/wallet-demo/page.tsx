'use client'

import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { contractService } from '@/lib/contract-service'
import { useState } from 'react'

export default function WalletDemo() {
  const { address, isConnecting, isDisconnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const [contractInfo, setContractInfo] = useState<any>(null)

  const testContract = async () => {
    if (!address) return;
    
    try {
      const account = contractService.getAccount();
      const chainId = contractService.getChainId();
      setContractInfo({ address, chainId, isConnected: account.isConnected });
    } catch (error) {
      console.error('Contract test failed:', error);
      setContractInfo({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8">
            🎉 Smart Contract Deployed Successfully!
          </h1>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 mb-8">
            <h2 className="text-2xl font-bold mb-4">Deployment Details</h2>
            <div className="space-y-2 text-sm font-mono">
              <div>📍 <strong>Contract Address:</strong> 0x7EF74176B51b13e8753C1Ca5055da870a5EC63f2</div>
              <div>🌐 <strong>Network:</strong> Filecoin Calibration Testnet</div>
              <div>🆔 <strong>Chain ID:</strong> 314159</div>
              <div>👤 <strong>Owner:</strong> 0x90D9CD66FAdFF1C2Ba32C99A47C76532d08A704B</div>
              <div>🔗 <strong>Transaction:</strong> 0xf8b6235ffcb7fa233a831ab41156177a0fe075a9dd7820ab72e942142f413196</div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 mb-8">
            <h2 className="text-2xl font-bold mb-4">Wallet Connection Test</h2>
            
            {isDisconnected && (
              <div>
                <p className="mb-4">Connect your wallet to interact with the contract:</p>
                {connectors.map((connector) => (
                  <button
                    key={connector.uid}
                    onClick={() => connect({ connector })}
                    disabled={isConnecting}
                    className="mr-4 mb-4 bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-semibold transition-colors"
                  >
                    {isConnecting ? 'Connecting...' : `Connect ${connector.name}`}
                  </button>
                ))}
              </div>
            )}

            {address && (
              <div>
                <p className="mb-4">✅ Connected to: <code className="bg-black/30 px-2 py-1 rounded text-green-400">{address}</code></p>
                <div className="space-x-4">
                  <button
                    onClick={testContract}
                    className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg font-semibold transition-colors"
                  >
                    Test Contract Connection
                  </button>
                  <button
                    onClick={() => disconnect()}
                    className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-lg font-semibold transition-colors"
                  >
                    Disconnect
                  </button>
                </div>
                
                {contractInfo && (
                  <div className="mt-4 bg-black/30 p-4 rounded-lg">
                    <pre className="text-sm">{JSON.stringify(contractInfo, null, 2)}</pre>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8">
            <h2 className="text-2xl font-bold mb-4">What's Next?</h2>
            <ul className="space-y-2">
              <li>✅ Smart contract deployed to Filecoin Calibration</li>
              <li>✅ Real wallet connectivity with RainbowKit</li>
              <li>✅ Contract service integration</li>
              <li>🚀 Ready to register creators and create products!</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}