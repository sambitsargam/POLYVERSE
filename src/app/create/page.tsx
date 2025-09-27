'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'
import { useRouter } from 'next/navigation'
import lighthouse from '@lighthouse-web3/sdk'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { contractService } from '@/lib/contract-service'
import { useUser } from '@/contexts/UserContext'

export default function CreateContent() {
  const { address, isConnected } = useAccount()
  const router = useRouter()
  const { profile, isRegistered } = useUser()
  const [step, setStep] = useState(1)
  const [contentFile, setContentFile] = useState<File | null>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [contentHash, setContentHash] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // Form data
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [productType, setProductType] = useState('digital_art')
  const [tags, setTags] = useState('')

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) {
      setError('Please select a file to upload')
      return
    }
    
    if (!address || !isConnected) {
      setError('Please connect your wallet first')
      return
    }

    setContentFile(file)
    setLoading(true)
    setError('')

    try {
      console.log('🔄 Starting file upload to Lighthouse...')
      
      // Upload file to Lighthouse (IPFS/Filecoin)
      console.log('📤 Uploading file to Lighthouse...')
      const output = await lighthouse.upload(
        [file], 
        process.env.NEXT_PUBLIC_LIGHTHOUSE_API_KEY || "7336c251-eea3-4d3b-8659-3420afe15b59" // Your API key
      )

      console.log('✅ File uploaded successfully:', output)
      
      if (!output?.data?.Hash) {
        throw new Error('No hash returned from Lighthouse upload')
      }

      setContentHash(output.data.Hash) // IPFS hash
      setUploadedFile(file)
      setStep(2)
      
      console.log('✅ Upload complete. IPFS Hash:', output.data.Hash)
      
    } catch (error) {
      console.error('❌ Upload failed:', error)
      const errorMessage = error instanceof Error ? error.message : 'Upload failed'
      setError(`Upload failed: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProduct = async () => {
    if (!isConnected || !address || !contentHash) {
      setError('Missing required data: wallet connection or uploaded content')
      return
    }

    if (!isRegistered) {
      setError('You must be registered as a creator first. Please register from your profile.')
      return
    }

    if (!title.trim() || !description.trim() || !price) {
      setError('Please fill in all required fields: title, description, and price')
      return
    }

    const priceValue = parseFloat(price)
    if (isNaN(priceValue) || priceValue <= 0) {
      setError('Please enter a valid price greater than 0')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      console.log('🚀 Creating product on blockchain with 1 FIL listing fee...', {
        title,
        description,
        priceUSD: priceValue,
        contentHash,
        productType,
        creator: address,
        listingFee: '1 FIL'
      })

      // Create product on the smart contract (includes 1 FIL listing fee)
      const receipt = await contractService.createProduct(
        title,
        description,
        priceValue,
        contentHash,
        productType
      )

      console.log('✅ Product created successfully!', receipt)
      setSuccess(`Product "${title}" created successfully! Listing fee of 1 FIL has been charged.`)
      
      // Reset form after successful creation
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
      
    } catch (error: any) {
      console.error('❌ Failed to create product:', error)
      
      let errorMessage = 'Failed to create product'
      
      if (error.message) {
        if (error.message.includes('Not a registered creator')) {
          errorMessage = 'You must register as a creator first. Please complete your profile registration.'
        } else if (error.message.includes('rejected')) {
          errorMessage = 'Transaction was rejected by user'
        } else if (error.message.includes('insufficient funds')) {
          errorMessage = 'Insufficient funds to pay for transaction'
        } else {
          errorMessage = `Error: ${error.message}`
        }
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Connect Your Wallet</h2>
            <p className="text-gray-600 mb-6">
              Connect your wallet to start creating and sharing content on the decentralized web.
            </p>
            <ConnectButton />
          </div>
        </div>
      </div>
    )
  }

  // Show registration prompt if not registered
  if (isConnected && !isRegistered) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Complete Registration</h2>
            <p className="text-gray-600 mb-6">
              You need to register as a creator before you can publish content. This is a one-time setup.
            </p>
            <button
              onClick={() => router.push('/register')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-200"
            >
              Register as Creator
            </button>
            <p className="text-sm text-gray-500 mt-4">
              Already registered? The system may need a moment to recognize your registration.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create Content</h1>
          <p className="mt-2 text-gray-600">Share your content with the world on the decentralized web</p>
        </div>

        {/* Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>1</div>
            <span className="text-sm text-gray-600">Upload</span>
            <div className="w-12 h-0.5 bg-gray-300"></div>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>2</div>
            <span className="text-sm text-gray-600">Details</span>
            <div className="w-12 h-0.5 bg-gray-300"></div>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>3</div>
            <span className="text-sm text-gray-600">Pricing</span>
            <div className="w-12 h-0.5 bg-gray-300"></div>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 4 ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>4</div>
            <span className="text-sm text-gray-600">Publish</span>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6">
            {success}
          </div>
        )}

        {/* Step 1: Upload */}
        {step === 1 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Upload Your Content</h2>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <div className="text-center">
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={loading}
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Uploading...' : 'Choose File'}
                </label>
                <p className="mt-2 text-sm text-gray-600">
                  Upload your content to IPFS/Filecoin via Lighthouse
                </p>
                {contentFile && (
                  <p className="mt-2 text-sm text-green-600">
                    Selected: {contentFile.name}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Details */}
        {step === 2 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Content Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter content title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe your content"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter tags separated by commas"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content Type</label>
                <select
                  value={productType}
                  onChange={(e) => setProductType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="digital_art">Digital Art</option>
                  <option value="ebook">E-book</option>
                  <option value="course">Course</option>
                  <option value="program">Software/Program</option>
                  <option value="music">Music</option>
                  <option value="video">Video</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={() => setStep(1)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!title || !description}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Pricing */}
        {step === 3 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Set Price</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (USD)</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={() => setStep(2)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(4)}
                  disabled={!price}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Publish */}
        {step === 4 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Publish Content</h2>
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="font-medium mb-2">Content Summary</h3>
                <p><strong>Title:</strong> {title}</p>
                <p><strong>Description:</strong> {description}</p>
                <p><strong>Content Type:</strong> {productType.replace('_', ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</p>
                <p><strong>Price:</strong> ${price}</p>
                <p><strong>Tags:</strong> {tags}</p>
                <p><strong>IPFS Hash:</strong> {contentHash}</p>
                <p><strong>File:</strong> {uploadedFile?.name}</p>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md">
                <h3 className="font-medium mb-2 text-yellow-800">Listing Fee</h3>
                <p className="text-yellow-700">A listing fee of <strong>1 FIL</strong> will be charged to publish your content on the marketplace.</p>
                <p className="text-sm text-yellow-600 mt-2">This fee helps maintain the platform and ensures quality content.</p>
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={() => setStep(3)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  onClick={handleCreateProduct}
                  disabled={loading}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center"
                >
                  {loading && (
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {loading ? 'Publishing & Paying Fee...' : 'Publish Content (1 FIL Fee)'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}