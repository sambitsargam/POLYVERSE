'use client'

import { useState, useEffect } from 'react'
import { FileUploader } from '@/components/FileUploader'
import { MockAccessControlContract } from '@/lib/accessControl'
import { FilecoinStorageService, type UploadProgress } from '@/lib/filecoin'
import { Navbar } from '@/components/Navbar'
import { useWallet } from '@/lib/wallet'

interface UploadedFile {
  cid: string
  name: string
  size: string
  uploadedAt: number
  isGated: boolean
  price: string
}

export default function FilecoinDemoPage() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [accessControl] = useState(() => new MockAccessControlContract())
  const [dealStatuses, setDealStatuses] = useState<Record<string, any>>({})
  
  // Use wallet hook
  const { 
    isConnected, 
    address, 
    connectWallet, 
    disconnectWallet, 
    chainId,
    balance,
    provider
  } = useWallet()

  // Initialize storage service
  const [storageService] = useState(() => {
    return new FilecoinStorageService(
      process.env.NEXT_PUBLIC_LIGHTHOUSE_API_KEY || '',
      process.env.NEXT_PUBLIC_GATEWAY_URL
    )
  })

  // Update storage service with wallet provider when available
  useEffect(() => {
    if (provider && storageService) {
      storageService.setWalletProvider(provider)
    }
  }, [provider, storageService])

  const handleFileUpload = async (result: { cid: string; size: string; name: string }) => {
    const uploadedFile: UploadedFile = {
      ...result,
      uploadedAt: Date.now(),
      isGated: false,
      price: '0.1' // Default price in USDC
    }

    setUploadedFiles(prev => [...prev, uploadedFile])

    // Simulate getting deal status after upload
    setTimeout(async () => {
      try {
        const dealStatus = await storageService.getDealStatus(result.cid)
        setDealStatuses(prev => ({ ...prev, [result.cid]: dealStatus }))
      } catch (error) {
        console.error('Error getting deal status:', error)
      }
    }, 2000)
  }

  const handleEnableGating = async (cid: string) => {
    setUploadedFiles(prev => 
      prev.map(file => 
        file.cid === cid ? { ...file, isGated: true } : file
      )
    )
  }

  const handlePurchase = async (cid: string) => {
    if (!address) {
      alert('❌ Please connect your wallet first')
      return
    }

    // TODO: Simulate KiraPay payment processing
    const mockTxHash = `0x${Math.random().toString(16).substring(2, 66)}`
    
    // Grant access after "payment"
    await accessControl.grantAccess(address, cid, mockTxHash)
    
    alert(`✅ Purchase successful! Access granted for CID: ${cid.substring(0, 20)}...`)
  }

  const handleDownload = async (cid: string) => {
    if (!address) {
      alert('❌ Please connect your wallet first')
      return
    }

    const hasAccess = await accessControl.hasAccess(address, cid)
    const file = uploadedFiles.find(f => f.cid === cid)
    
    if (file?.isGated && !hasAccess) {
      alert('❌ Access denied! Please purchase access first.')
      return
    }

    try {
      // For demo, just show success - in production would download actual file
      const url = storageService.getFileUrl(cid)
      window.open(url, '_blank')
      alert(`✅ Download initiated for: ${file?.name}`)
    } catch (error) {
      alert('❌ Download failed')
    }
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
        <div className="max-w-6xl mx-auto px-4 py-8">
          
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              🗄️ Filecoin Storage Demo
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Upload files to Filecoin via Lighthouse SDK, enable token gating, and demonstrate 
              access control for digital goods on POLYVERSE.
            </p>
          </div>

          {/* Connection Status */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Wallet Connection</h2>
            {isConnected ? (
              <div className="flex items-center space-x-4">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-700">Connected:</span>
                <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                  {address?.substring(0, 10)}...{address?.substring(-8)}
                </code>
                <button
                  onClick={disconnectWallet}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-gray-700">Not connected</span>
                <button
                  onClick={connectWallet}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Connect Wallet
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Upload Section */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                📤 Upload to Filecoin
              </h2>
              <p className="text-gray-600 mb-6">
                Upload files to Filecoin's decentralized storage network via Lighthouse SDK.
                Files will be pinned to IPFS and stored on Filecoin with storage deals.
              </p>
              
              <FileUploader
                onUpload={handleFileUpload}
                maxSize={50 * 1024 * 1024} // 50MB for demo
                className="mb-4"
              />
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                <h4 className="font-medium text-blue-900 mb-2">📋 Demo Configuration</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Network: Filecoin Calibration Testnet</li>
                  <li>• Gateway: Lighthouse IPFS Gateway</li>
                  <li>• Storage: Mock implementation (replace with real API key)</li>
                  <li>• Encryption: Available for premium content</li>
                </ul>
              </div>
            </div>

            {/* Uploaded Files */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                📁 Uploaded Files ({uploadedFiles.length})
              </h2>
              
              {uploadedFiles.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <p>No files uploaded yet</p>
                  <p className="text-sm">Upload a file to get started</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {uploadedFiles.map((file) => (
                    <div key={file.cid} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{file.name}</h3>
                          <p className="text-sm text-gray-600">
                            {(parseInt(file.size) / 1024).toFixed(1)} KB • {new Date(file.uploadedAt).toLocaleString()}
                          </p>
                          <code className="text-xs text-gray-500 block mt-1">
                            {file.cid.substring(0, 30)}...
                          </code>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          {file.isGated ? (
                            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                              🔒 Gated
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                              🌐 Public
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Deal Status */}
                      {dealStatuses[file.cid] && (
                        <div className="mb-3 p-3 bg-gray-50 rounded border">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">📦 Filecoin Deal Status</h4>
                          <div className="text-xs text-gray-600 space-y-1">
                            <div>Status: <span className="font-medium">{dealStatuses[file.cid].data?.[0]?.dealStatus || 'Pending'}</span></div>
                            <div>Deal ID: <span className="font-medium">{dealStatuses[file.cid].data?.[0]?.dealId || 'N/A'}</span></div>
                            <div>Miner: <span className="font-medium">{dealStatuses[file.cid].data?.[0]?.miner || 'N/A'}</span></div>
                          </div>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleDownload(file.cid)}
                          className="px-3 py-1 bg-emerald-100 text-emerald-700 text-sm rounded hover:bg-emerald-200 transition-colors"
                        >
                          📥 Download
                        </button>
                        
                        {!file.isGated && (
                          <button
                            onClick={() => handleEnableGating(file.cid)}
                            className="px-3 py-1 bg-yellow-100 text-yellow-700 text-sm rounded hover:bg-yellow-200 transition-colors"
                          >
                            🔐 Enable Gating
                          </button>
                        )}
                        
                        {file.isGated && isConnected && (
                          <button
                            onClick={() => handlePurchase(file.cid)}
                            className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded hover:bg-blue-200 transition-colors"
                          >
                            💰 Purchase (${file.price})
                          </button>
                        )}

                        <a
                          href={storageService.getFileUrl(file.cid)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200 transition-colors"
                        >
                          🔗 IPFS Gateway
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Access Control Demo */}
          <div className="bg-white rounded-lg shadow-lg p-6 mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              🛡️ Access Control Demo
            </h2>
            <p className="text-gray-600 mb-6">
              This demonstrates token-gated access to uploaded content. In production, this would 
              integrate with KiraPay for payments and mint ERC-721 access tokens.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">🔑 Current Access Tokens</h3>
                <div className="text-sm text-gray-600">
                  {isConnected && address ? (
                    <div>
                      <p>Wallet: {address.substring(0, 10)}...{address.substring(-8)}</p>
                      <p className="mt-2">Tokens: {Object.keys(accessControl.getAllTokens()).length}</p>
                      <p className="mt-1">Chain ID: {chainId}</p>
                      <p className="mt-1">Balance: {balance} FIL</p>
                    </div>
                  ) : (
                    <p>Connect wallet to view access tokens</p>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">⚙️ Implementation Notes</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Payment system integration (TODO: KiraPay)</li>
                  <li>• Local storage for access tokens (replace with smart contract)</li>
                  <li>• Client-side encryption support ready</li>
                  <li>• ERC-721 NFT access tokens (TODO)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Setup Instructions */}
          <div className="bg-white rounded-lg shadow-lg p-6 mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              ⚙️ Setup Instructions
            </h2>
            <div className="prose max-w-none text-gray-600">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">To enable real Filecoin storage:</h3>
              <ol className="list-decimal list-inside space-y-2 mb-4">
                <li>Create an account at <a href="https://files.lighthouse.storage/" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:text-emerald-700">files.lighthouse.storage</a></li>
                <li>Generate an API key from the dashboard</li>
                <li>Add <code className="bg-gray-100 px-1 rounded">LIGHTHOUSE_API_KEY=your_key_here</code> to your .env.local file</li>
                <li>Replace <code className="bg-gray-100 px-1 rounded">MockFilecoinStorageService</code> with <code className="bg-gray-100 px-1 rounded">FilecoinStorageService</code></li>
              </ol>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">For production deployment:</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Deploy access control smart contract to Filecoin/Polygon</li>
                <li>Integrate KiraPay payment processing</li>
                <li>Add proper encryption/decryption keys management</li>
                <li>Implement ERC-721 NFT minting for access tokens</li>
                <li>Add storage deal monitoring and PoDSI verification</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}