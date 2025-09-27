'use client'

import { useState } from 'react'
import { useWallet } from '@/lib/wallet'
import { SUPPORTED_CHAINS, TOKENS, oneInchFusion } from '@/lib/oneinch-fusion'

export default function OneInchDemoPage() {
  const { isConnected, address, connectWallet } = useWallet()
  const [sourceChain, setSourceChain] = useState<number>(80002) // Polygon Amoy
  const [destChain, setDestChain] = useState<number>(11155111) // Sepolia
  const [sourceToken, setSourceToken] = useState<string>(TOKENS.WMATIC_AMOY.address)
  const [destToken, setDestToken] = useState<string>(TOKENS.USDC_SEPOLIA.address)
  const [amount, setAmount] = useState<string>('1')
  const [quote, setQuote] = useState<any>(null)
  const [intent, setIntent] = useState<any>(null)
  const [loading, setLoading] = useState<{quote: boolean, intent: boolean, monitor: boolean}>({
    quote: false,
    intent: false, 
    monitor: false
  })
  const [status, setStatus] = useState<any>(null)

  const handleGetQuote = async () => {
    if (!address) return
    
    setLoading(prev => ({...prev, quote: true}))
    try {
      const response = await fetch('/api/1inch/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          srcChainId: sourceChain,
          dstChainId: destChain,
          srcTokenAddress: sourceToken,
          dstTokenAddress: destToken,
          amount: (parseFloat(amount) * 1e18).toString(), // Convert to wei
          walletAddress: address
        })
      })
      
      const result = await response.json()
      if (result.success) {
        setQuote(result.data)
      } else {
        alert('Failed to get quote: ' + result.error)
      }
    } catch (error) {
      console.error('Quote error:', error)
      alert('Failed to get quote')
    } finally {
      setLoading(prev => ({...prev, quote: false}))
    }
  }

  const handleCreateIntent = async () => {
    if (!quote || !address) return
    
    setLoading(prev => ({...prev, intent: true}))
    try {
      const response = await fetch('/api/1inch/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quoteData: quote,
          makerAddress: address
        })
      })
      
      const result = await response.json()
      if (result.success) {
        setIntent(result.data)
        // Start monitoring
        setTimeout(() => handleMonitorIntent(result.data.intentId), 2000)
      } else {
        alert('Failed to create intent: ' + result.error)
      }
    } catch (error) {
      console.error('Intent error:', error)
      alert('Failed to create intent')
    } finally {
      setLoading(prev => ({...prev, intent: false}))
    }
  }

  const handleMonitorIntent = async (intentId: string) => {
    setLoading(prev => ({...prev, monitor: true}))
    try {
      const response = await fetch(`/api/1inch/monitor?intentId=${intentId}`)
      const result = await response.json()
      if (result.success) {
        setStatus(result.data)
        
        // Continue monitoring if not completed
        if (result.data.status !== 'completed' && result.data.status !== 'failed') {
          setTimeout(() => handleMonitorIntent(intentId), 5000)
        }
      }
    } catch (error) {
      console.error('Monitor error:', error)
    } finally {
      setLoading(prev => ({...prev, monitor: false}))
    }
  }

  const getTokenInfo = (address: string, chainId: number) => {
    return Object.values(TOKENS).find(t => 
      t.address.toLowerCase() === address.toLowerCase() && t.chainId === chainId
    )
  }

  const getChainInfo = (chainId: number) => {
    return Object.values(SUPPORTED_CHAINS).find(c => c.chainId === chainId)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
            <h1 className="text-2xl font-bold text-white">1inch Fusion+ Demo</h1>
            <p className="text-blue-100 mt-1">
              Test cross-chain swaps with 1inch Fusion+ integration
            </p>
          </div>

          <div className="p-6">
            {!isConnected ? (
              <div className="text-center py-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Connect Wallet to Continue
                </h3>
                <button
                  onClick={connectWallet}
                  className="btn-primary"
                >
                  Connect Wallet
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Wallet Info */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-medium text-green-900">✓ Wallet Connected</h3>
                  <p className="text-sm text-green-700 mt-1">
                    Address: {address?.substring(0, 10)}...{address?.substring(-8)}
                  </p>
                </div>

                {/* Configuration */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Source Chain */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Source Chain
                    </label>
                    <select
                      value={sourceChain}
                      onChange={(e) => setSourceChain(parseInt(e.target.value))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {Object.values(SUPPORTED_CHAINS).map(chain => (
                        <option key={chain.chainId} value={chain.chainId}>
                          {chain.name} (Chain ID: {chain.chainId})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Destination Chain */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Destination Chain
                    </label>
                    <select
                      value={destChain}
                      onChange={(e) => setDestChain(parseInt(e.target.value))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {Object.values(SUPPORTED_CHAINS).map(chain => (
                        <option key={chain.chainId} value={chain.chainId}>
                          {chain.name} (Chain ID: {chain.chainId})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Source Token */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Source Token
                    </label>
                    <select
                      value={sourceToken}
                      onChange={(e) => setSourceToken(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {Object.values(TOKENS)
                        .filter(token => token.chainId === sourceChain)
                        .map(token => (
                          <option key={token.address} value={token.address}>
                            {token.symbol} - {token.address.substring(0, 10)}...
                          </option>
                        ))}
                    </select>
                  </div>

                  {/* Destination Token */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Destination Token
                    </label>
                    <select
                      value={destToken}
                      onChange={(e) => setDestToken(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {Object.values(TOKENS)
                        .filter(token => token.chainId === destChain)
                        .map(token => (
                          <option key={token.address} value={token.address}>
                            {token.symbol} - {token.address.substring(0, 10)}...
                          </option>
                        ))}
                    </select>
                  </div>

                  {/* Amount */}
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Amount
                    </label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="1.0"
                      step="0.1"
                      min="0"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-4">
                  <button
                    onClick={handleGetQuote}
                    disabled={loading.quote || !amount}
                    className="btn-primary flex-1"
                  >
                    {loading.quote ? 'Getting Quote...' : 'Get Quote'}
                  </button>

                  {quote && (
                    <button
                      onClick={handleCreateIntent}
                      disabled={loading.intent}
                      className="btn-secondary flex-1"
                    >
                      {loading.intent ? 'Creating Intent...' : 'Create Intent'}
                    </button>
                  )}
                </div>

                {/* Quote Display */}
                {quote && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-medium text-blue-900 mb-3">Quote Details</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-blue-700">Source Amount:</span>
                        <p className="font-mono">{quote.srcAmount} {getTokenInfo(quote.srcToken.address, quote.srcChainId)?.symbol}</p>
                      </div>
                      <div>
                        <span className="text-blue-700">Destination Amount:</span>
                        <p className="font-mono">{quote.dstAmount} {getTokenInfo(quote.dstToken.address, quote.dstChainId)?.symbol}</p>
                      </div>
                      <div>
                        <span className="text-blue-700">Source Chain:</span>
                        <p>{getChainInfo(quote.srcChainId)?.name}</p>
                      </div>
                      <div>
                        <span className="text-blue-700">Destination Chain:</span>
                        <p>{getChainInfo(quote.dstChainId)?.name}</p>
                      </div>
                      <div>
                        <span className="text-blue-700">Slippage:</span>
                        <p>{quote.slippage}%</p>
                      </div>
                      <div>
                        <span className="text-blue-700">Estimated Gas:</span>
                        <p>{quote.gas} wei</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Intent Display */}
                {intent && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h3 className="font-medium text-purple-900 mb-3">
                      Intent Created
                      {loading.monitor && (
                        <span className="ml-2 text-sm">
                          (Monitoring...)
                        </span>
                      )}
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-purple-700">Intent ID:</span>
                        <p className="font-mono text-xs break-all">{intent.intentId}</p>
                      </div>
                      <div>
                        <span className="text-purple-700">Maker:</span>
                        <p className="font-mono text-xs">{intent.maker}</p>
                      </div>
                      <div>
                        <span className="text-purple-700">Status:</span>
                        <p className="font-medium capitalize">{intent.status || 'pending'}</p>
                      </div>
                    </div>

                    {/* Explorer Links */}
                    {intent.explorerUrls && (
                      <div className="mt-3 space-y-1">
                        <a 
                          href={intent.explorerUrls.srcChain} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:text-blue-700 underline block"
                        >
                          View on {getChainInfo(intent.srcChainId)?.name} Explorer
                        </a>
                        <a 
                          href={intent.explorerUrls.dstChain} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:text-blue-700 underline block"
                        >
                          View on {getChainInfo(intent.dstChainId)?.name} Explorer
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {/* Status Display */}
                {status && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h3 className="font-medium text-yellow-900 mb-3">Execution Status</h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-yellow-700">Current Status:</span>
                        <p className="font-medium capitalize">{status.status}</p>
                      </div>
                      {status.srcTxHash && (
                        <div>
                          <span className="text-yellow-700">Source Transaction:</span>
                          <p className="font-mono text-xs break-all">{status.srcTxHash}</p>
                        </div>
                      )}
                      {status.dstTxHash && (
                        <div>
                          <span className="text-yellow-700">Destination Transaction:</span>
                          <p className="font-mono text-xs break-all">{status.dstTxHash}</p>
                        </div>
                      )}
                      {status.explorerLinks && (
                        <div className="space-y-1 mt-3">
                          {status.explorerLinks.srcTransaction && (
                            <a 
                              href={status.explorerLinks.srcTransaction} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:text-blue-700 underline block"
                            >
                              View Source Transaction
                            </a>
                          )}
                          {status.explorerLinks.dstTransaction && (
                            <a 
                              href={status.explorerLinks.dstTransaction} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:text-blue-700 underline block"
                            >
                              View Destination Transaction
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Important Notes */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">📋 Demo Notes</h3>
                  <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                    <li>This demo uses mock data and simulated responses</li>
                    <li>Real implementation requires 1inch API integration</li>
                    <li>Testnet tokens may be needed for actual transactions</li>
                    <li>Transaction hashes are generated for demonstration</li>
                    <li>TODO markers indicate areas needing real implementation</li>
                  </ul>
                </div>

                {/* API Documentation Links */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-medium text-blue-900 mb-2">🔗 Documentation Links</h3>
                  <div className="space-y-1">
                    <a 
                      href="https://portal.1inch.dev/documentation/apis/swap/fusion-plus/introduction" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-700 underline block"
                    >
                      1inch Fusion+ API Documentation
                    </a>
                    <a 
                      href="https://1inch.io/assets/1inch-fusion-plus.pdf" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-700 underline block"
                    >
                      1inch Fusion+ Specification PDF
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}