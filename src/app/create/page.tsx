'use client'

import { useState } from 'react'
import { useAccount, useWalletClient } from 'wagmi'
import { SynapseService } from '@/lib/synapse-service'
import { getSigner } from '@/lib/viem-utils'
import { ConnectButton } from '@rainbow-me/rainbowkit'

export default function CreateContent() {
  const { address, isConnected } = useAccount()
  const { data: walletClient } = useWalletClient()
  const [step, setStep] = useState(1)
  const [contentFile, setContentFile] = useState<File | null>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [contentHash, setContentHash] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  // Form data
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [tags, setTags] = useState('')

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !address || !isConnected) return

    setContentFile(file)
    setLoading(true)
    setError('')

    try {
      // Initialize Synapse service
      const signer = await getSigner(walletClient)
      if (!signer) {
        throw new Error('Could not get signer')
      }

      const synapseService = new SynapseService({
        withCDN: true,
        storageCapacity: 100,
        persistencePeriod: 365
      })

      const initResult = await synapseService.initialize(signer)
      if (!initResult.success) {
        throw new Error(initResult.error || 'Failed to initialize Synapse')
      }

      // Upload file to Filecoin using Synapse
      const result = await synapseService.uploadFile(
        file,
        address,
        (progress) => console.log('Upload progress:', progress),
        (status) => console.log('Upload status:', status)
      )

      setContentHash(result.data.pieceCid)
      setUploadedFile(file)
      setStep(2)
    } catch (error) {
      console.error('Upload failed:', error)
      setError(error instanceof Error ? error.message : 'Upload failed')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProduct = async () => {
    if (!isConnected || !address || !contentHash) {
      setError('Missing required data')
      return
    }

    setLoading(true)
    try {
      // Here you would interact with your smart contract
      // to create a product with the uploaded content
      console.log('Creating product with:', {
        title,
        description,
        price,
        tags,
        contentHash,
        creator: address
      })
      
      // Navigate to success page or dashboard
      // router.push('/dashboard')
    } catch (error) {
      console.error('Failed to create product:', error)
      setError(error instanceof Error ? error.message : 'Failed to create product')
    } finally {
      setLoading(false)
    }
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Create Content</h1>
          <p className="text-gray-600 mb-6">Please connect your wallet to create content.</p>
          <div className="flex justify-center">
            <ConnectButton />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Create Content</h1>
          
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center">
              <div className={`flex-1 ${step >= 1 ? 'bg-blue-600' : 'bg-gray-300'} h-1 rounded`}></div>
              <div className={`mx-4 w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>1</div>
              <div className={`flex-1 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-300'} h-1 rounded`}></div>
              <div className={`mx-4 w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>2</div>
              <div className={`flex-1 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-300'} h-1 rounded`}></div>
              <div className={`mx-4 w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>3</div>
              <div className={`flex-1 ${step >= 4 ? 'bg-blue-600' : 'bg-gray-300'} h-1 rounded`}></div>
            </div>
            <div className="flex justify-between mt-2 text-sm text-gray-500">
              <span>Upload</span>
              <span>Details</span>
              <span>Pricing</span>
              <span>Publish</span>
            </div>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          {/* Step 1: File Upload */}
          {step === 1 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Upload Your Content</h2>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  accept="image/*,video/*,audio/*,.pdf,.txt,.zip"
                  onChange={handleFileUpload}
                  disabled={loading}
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer"
                >
                  {uploadedFile ? (
                    <div>
                      <p className="text-lg font-medium text-gray-900">{uploadedFile.name}</p>
                      <p className="text-gray-500">
                        {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      {contentHash && (
                        <p className="text-sm text-green-600 mt-2">
                          ✓ Uploaded to Filecoin: {contentHash.slice(0, 20)}...
                        </p>
                      )}
                    </div>
                  ) : (
                    <div>
                      <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <p className="mt-2 text-sm text-gray-600">
                        <span className="font-medium text-blue-600">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">
                        Images, videos, audio, documents up to 100MB
                      </p>
                    </div>
                  )}
                </label>
              </div>
              {loading && (
                <div className="mt-4 text-center">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <p className="mt-2 text-sm text-gray-600">Uploading to Filecoin...</p>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Content Details */}
          {step === 2 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Content Details</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter content title..."
                  />
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    id="description"
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Describe your content..."
                  />
                </div>
                <div>
                  <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    id="tags"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="art, music, video, exclusive..."
                  />
                </div>
              </div>
              <div className="mt-6 flex space-x-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!title || !description}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Pricing */}
          {step === 3 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Set Pricing</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                    Price (in FIL)
                  </label>
                  <input
                    type="number"
                    id="price"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    min="0"
                    step="0.01"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.00"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Set to 0 for free content
                  </p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Content Preview</h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>File:</strong> {uploadedFile?.name}</p>
                    <p><strong>Title:</strong> {title}</p>
                    <p><strong>Description:</strong> {description}</p>
                    <p><strong>Tags:</strong> {tags}</p>
                    <p><strong>Price:</strong> {price || '0'} FIL</p>
                    <p><strong>Content Hash:</strong> {contentHash.slice(0, 30)}...</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex space-x-3">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                >
                  Back
                </button>
                <button
                  onClick={handleCreateProduct}
                  disabled={loading || !price}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Product'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}