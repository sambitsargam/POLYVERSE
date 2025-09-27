'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

export default function PurchaseSuccess() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [purchaseData, setPurchaseData] = useState<any>(null)
  const productId = searchParams.get('productId')

  useEffect(() => {
    // Get the pending purchase from localStorage
    const pendingPurchase = localStorage.getItem('pending_purchase')
    if (pendingPurchase) {
      const purchase = JSON.parse(pendingPurchase)
      setPurchaseData(purchase)
      
      // Clear the pending purchase
      localStorage.removeItem('pending_purchase')
      
      // Here you could also verify the payment with KiraPay API
      // and update the blockchain contract if needed
    }
  }, [])

  const handleDownload = () => {
    if (purchaseData?.contentHash) {
      // In a real implementation, you'd fetch from IPFS
      // window.open(`https://gateway.pinata.cloud/ipfs/${purchaseData.contentHash}`, '_blank')
      alert('Download functionality would be implemented here with IPFS access')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="h-16 w-16 text-green-500 mx-auto mb-4 flex items-center justify-center">
            <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
          <p className="text-gray-600">Thank you for your purchase</p>
        </div>

        {purchaseData ? (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-medium text-gray-900 mb-2">Purchase Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Product:</span>
                <span className="font-medium">{purchaseData.productTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Amount:</span>
                <span className="font-medium">${purchaseData.amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Creator:</span>
                <span className="font-medium font-mono text-xs">
                  {purchaseData.creator?.slice(0, 8)}...{purchaseData.creator?.slice(-6)}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-yellow-50 rounded-lg p-4 mb-6">
            <p className="text-yellow-800 text-sm">
              Purchase details not found. Please check your wallet for transaction confirmation.
            </p>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={handleDownload}
            disabled={!purchaseData}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download Content
          </button>
          
          <button
            onClick={() => router.push('/marketplace')}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition duration-200 flex items-center justify-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Marketplace
          </button>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-800">
            <strong>Next Steps:</strong> You can access your purchased content anytime from your profile. 
            The content is stored securely on IPFS and linked to your wallet address.
          </p>
        </div>
      </div>
    </div>
  )
}