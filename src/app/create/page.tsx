'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'
import { contractService } from '@/lib/contract-service'
import { SynapseService } from '@/lib/synapse-service'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { ArrowUpTrayIcon, PhotoIcon, DocumentIcon, MusicalNoteIcon, VideoCameraIcon } from '@heroicons/react/24/outline'

export default function CreateContentPage() {
  const { address, isConnected } = useAccount()
  const [step, setStep] = useState(1) // 1: Upload, 2: Details, 3: Pricing, 4: Review
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [contentHash, setContentHash] = useState('')
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'digital-art',
    price: '',
    tags: '',
    isExclusive: false
  })
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const contentTypes = [
    { id: 'digital-art', name: 'Digital Art', icon: PhotoIcon, color: 'from-pink-500 to-purple-600' },
    { id: 'music', name: 'Music', icon: MusicalNoteIcon, color: 'from-green-500 to-blue-600' },
    { id: 'video', name: 'Video', icon: VideoCameraIcon, color: 'from-red-500 to-orange-600' },
    { id: 'document', name: 'Document', icon: DocumentIcon, color: 'from-blue-500 to-indigo-600' },
  ]

  const handleFileUpload = async (file: File) => {
    if (!isConnected || !address) {
      setError('Please connect your wallet first')
      return
    }

    setLoading(true)
    setError('')
    setUploadedFile(file)

    try {
      // Create service instance and upload to Filecoin using Synapse
      const synapseService = new SynapseService()
      const result = await synapseService.uploadFile(file, {
        fileName: file.name,
        metadata: {
          creator: address,
          uploadedAt: new Date().toISOString(),
          fileType: file.type
        }
      })

      setContentHash(result.cid)
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
    setError('')

    try {
      const receipt = await contractService.createProduct(
        formData.title,
        formData.description,
        parseFloat(formData.price),
        contentHash,
        formData.category
      )

      console.log('Product created:', receipt)
      
      // Redirect to success or dashboard
      window.location.href = '/dashboard'
    } catch (error) {
      console.error('Product creation failed:', error)
      setError(error instanceof Error ? error.message : 'Product creation failed')
    } finally {
      setLoading(false)
    }
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-4">🎨 Create Content</h1>
            <p className="text-xl text-gray-300 mb-8">
              Upload and sell your digital creations on the decentralized web
            </p>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8">
              <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
              <p className="text-gray-300 mb-6">
                Connect your wallet to start uploading content
              </p>
              <ConnectButton />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-4 mb-4">
              {[1, 2, 3, 4].map((stepNum) => (
                <div key={stepNum} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    step >= stepNum ? 'bg-purple-600' : 'bg-gray-600'
                  }`}>
                    {stepNum}
                  </div>
                  {stepNum < 4 && <div className="w-16 h-1 bg-gray-600 mx-2" />}
                </div>
              ))}
            </div>
            <div className="text-center text-sm text-gray-300">
              {step === 1 && 'Upload Content'}
              {step === 2 && 'Content Details'}
              {step === 3 && 'Set Pricing'}
              {step === 4 && 'Review & Publish'}
            </div>
          </div>

          {/* Step 1: Upload */}
          {step === 1 && (
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8">
              <h2 className="text-3xl font-bold mb-6 text-center">Upload Your Content</h2>
              
              <div className="border-2 border-dashed border-gray-400 rounded-xl p-12 text-center hover:border-purple-500 transition-colors">
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])}
                  accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <ArrowUpTrayIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-xl font-semibold mb-2">Choose file to upload</h3>
                  <p className="text-gray-400 mb-4">
                    Drag and drop or click to select files
                  </p>
                  <p className="text-sm text-gray-500">
                    Supported: Images, Videos, Audio, Documents (Max 100MB)
                  </p>
                </label>
              </div>

              {loading && (
                <div className="mt-6 bg-blue-600/20 p-4 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-400 border-t-transparent"></div>
                    <span>Uploading to Filecoin...</span>
                  </div>
                  {uploadProgress > 0 && (
                    <div className="mt-2 bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  )}
                </div>
              )}

              {error && (
                <div className="mt-6 bg-red-600/20 border border-red-600 p-4 rounded-lg">
                  <p className="text-red-300">{error}</p>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Details */}
          {step === 2 && (
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8">
              <h2 className="text-3xl font-bold mb-6">Content Details</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold mb-2">Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="Give your content a catchy title"
                    className="w-full px-4 py-3 bg-black/30 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Description *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Describe your content and what makes it special..."
                    rows={4}
                    className="w-full px-4 py-3 bg-black/30 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Category</label>
                  <div className="grid grid-cols-2 gap-4">
                    {contentTypes.map((type) => (
                      <div
                        key={type.id}
                        onClick={() => setFormData({...formData, category: type.id})}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          formData.category === type.id 
                            ? 'border-purple-500 bg-purple-600/20' 
                            : 'border-gray-600 bg-black/20 hover:border-gray-500'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <type.icon className="w-6 h-6" />
                          <span className="font-semibold">{type.name}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Tags (Optional)</label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({...formData, tags: e.target.value})}
                    placeholder="art, digital, exclusive (comma-separated)"
                    className="w-full px-4 py-3 bg-black/30 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="flex justify-between">
                  <button
                    onClick={() => setStep(1)}
                    className="px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg font-semibold transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    disabled={!formData.title || !formData.description}
                    className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-colors disabled:opacity-50"
                  >
                    Next: Pricing
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Pricing */}
          {step === 3 && (
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8">
              <h2 className="text-3xl font-bold mb-6">Set Your Price</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold mb-2">Price (USD) *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      placeholder="0.00"
                      className="w-full pl-8 pr-4 py-3 bg-black/30 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>
                  <p className="text-sm text-gray-400 mt-1">
                    Set to $0 for free content
                  </p>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="exclusive"
                    checked={formData.isExclusive}
                    onChange={(e) => setFormData({...formData, isExclusive: e.target.checked})}
                    className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded"
                  />
                  <label htmlFor="exclusive" className="text-sm font-semibold">
                    Exclusive Content
                  </label>
                </div>
                <p className="text-sm text-gray-400 ml-7">
                  Mark as exclusive for premium pricing
                </p>

                <div className="bg-blue-600/20 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">💡 Pricing Tips</h3>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• Start with competitive pricing to build your audience</li>
                    <li>• Consider offering some free content to attract followers</li>
                    <li>• Premium/exclusive content can command higher prices</li>
                    <li>• You can update pricing later if needed</li>
                  </ul>
                </div>

                <div className="flex justify-between">
                  <button
                    onClick={() => setStep(2)}
                    className="px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg font-semibold transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setStep(4)}
                    disabled={!formData.price && formData.price !== '0'}
                    className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-colors disabled:opacity-50"
                  >
                    Review
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {step === 4 && (
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8">
              <h2 className="text-3xl font-bold mb-6">Review & Publish</h2>
              
              <div className="space-y-6">
                <div className="bg-black/20 p-6 rounded-lg">
                  <h3 className="text-xl font-bold mb-4">{formData.title}</h3>
                  <p className="text-gray-300 mb-4">{formData.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Category:</span>
                      <span className="ml-2 font-semibold capitalize">{formData.category.replace('-', ' ')}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Price:</span>
                      <span className="ml-2 font-semibold">
                        {parseFloat(formData.price) > 0 ? `$${formData.price}` : 'Free'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Type:</span>
                      <span className="ml-2 font-semibold">
                        {formData.isExclusive ? 'Exclusive' : 'Standard'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">File:</span>
                      <span className="ml-2 font-semibold">{uploadedFile?.name}</span>
                    </div>
                  </div>
                  
                  {contentHash && (
                    <div className="mt-4 p-3 bg-green-600/20 rounded border border-green-600">
                      <p className="text-sm">
                        <span className="text-gray-400">Content Hash:</span>
                        <span className="ml-2 font-mono text-green-400 break-all">{contentHash}</span>
                      </p>
                    </div>
                  )}
                </div>

                <div className="bg-yellow-600/20 border border-yellow-600 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">⚠️ Before Publishing:</h3>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• Publishing requires a small gas fee</li>
                    <li>• Content will be permanently stored on Filecoin</li>
                    <li>• Product details can be updated, but file cannot be changed</li>
                    <li>• Make sure you have FIL in your wallet for gas fees</li>
                  </ul>
                </div>

                {error && (
                  <div className="bg-red-600/20 border border-red-600 p-4 rounded-lg">
                    <p className="text-red-300">{error}</p>
                  </div>
                )}

                <div className="flex justify-between">
                  <button
                    onClick={() => setStep(3)}
                    className="px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg font-semibold transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleCreateProduct}
                    disabled={loading}
                    className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-lg font-bold transition-all transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
                  >
                    {loading ? 'Publishing...' : '🚀 Publish Content'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}