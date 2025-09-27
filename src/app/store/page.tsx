'use client'

import { useState, useEffect } from 'react'
import { FileUploader } from '@/components/FileUploader'
import { useAccount } from 'wagmi'
import { CloudArrowUpIcon, MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline'

interface StoredFile {
  cid: string
  name: string
  size: string
  uploadedAt: number
  price: string
  description: string
  owner: string
  isGated: boolean
}

export default function StorePage() {
  const [storedFiles, setStoredFiles] = useState<StoredFile[]>([])
  const [filteredFiles, setFilteredFiles] = useState<StoredFile[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [priceFilter, setPriceFilter] = useState('all')
  const [showUploadModal, setShowUploadModal] = useState(false)
  
  const { isConnected, address } = useAccount()

  useEffect(() => {
    // Load stored files from localStorage (in production, this would come from a backend)
    const stored = localStorage.getItem('filecoin-stored-files')
    if (stored) {
      const files = JSON.parse(stored)
      setStoredFiles(files)
      setFilteredFiles(files)
    }
  }, [])

  useEffect(() => {
    let filtered = storedFiles

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(file => 
        file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        file.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply price filter
    if (priceFilter !== 'all') {
      if (priceFilter === 'free') {
        filtered = filtered.filter(file => parseFloat(file.price) === 0)
      } else if (priceFilter === 'paid') {
        filtered = filtered.filter(file => parseFloat(file.price) > 0)
      }
    }

    setFilteredFiles(filtered)
  }, [storedFiles, searchQuery, priceFilter])

  const handleFileUpload = (result: { cid: string; size: string; name: string }) => {
    if (!address) return

    const newFile: StoredFile = {
      ...result,
      uploadedAt: Date.now(),
      price: '0', // Default free, can be updated later
      description: 'Uploaded via POLYVERSE',
      owner: address,
      isGated: false
    }

    const updatedFiles = [...storedFiles, newFile]
    setStoredFiles(updatedFiles)
    localStorage.setItem('filecoin-stored-files', JSON.stringify(updatedFiles))
    setShowUploadModal(false)
  }

  const handlePurchase = async (file: StoredFile) => {
    if (!isConnected) {
      alert('Please connect your wallet first')
      return
    }

    // Mock purchase flow
    alert(`🎉 Successfully purchased "${file.name}" for $${file.price}!`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Filecoin Store</h1>
              <p className="text-gray-600 mt-1">Discover and purchase decentralized content</p>
            </div>
            <button
              onClick={() => setShowUploadModal(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <CloudArrowUpIcon className="w-5 h-5" />
              <span>Upload Content</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="mb-8 space-y-4 sm:flex sm:space-y-0 sm:space-x-4 sm:items-center">
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-2">
            <FunnelIcon className="w-5 h-5 text-gray-400" />
            <select
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="all">All Prices</option>
              <option value="free">Free</option>
              <option value="paid">Paid</option>
            </select>
          </div>
        </div>

        {/* Content Grid */}
        {filteredFiles.length === 0 ? (
          <div className="text-center py-12">
            <CloudArrowUpIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No files found</h3>
            <p className="text-gray-500">
              {storedFiles.length === 0 
                ? 'Be the first to upload content to the Filecoin network!'
                : 'Try adjusting your search or filters.'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFiles.map((file) => (
              <div key={file.cid} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-gray-900 text-lg truncate flex-1">{file.name}</h3>
                    <div className="flex items-center space-x-2 ml-2">
                      {file.isGated && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Gated
                        </span>
                      )}
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        parseFloat(file.price) === 0 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {parseFloat(file.price) === 0 ? 'Free' : `$${file.price}`}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">{file.description}</p>
                  
                  <div className="space-y-2 text-xs text-gray-500 mb-4">
                    <div>Size: {(parseInt(file.size) / 1024).toFixed(1)} KB</div>
                    <div>Uploaded: {new Date(file.uploadedAt).toLocaleDateString()}</div>
                    <div>Owner: {file.owner.substring(0, 6)}...{file.owner.substring(-4)}</div>
                  </div>
                  
                  <div className="border-t border-gray-100 pt-4">
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono block truncate">
                      {file.cid}
                    </code>
                  </div>
                  
                  <div className="flex space-x-2 mt-4">
                    {parseFloat(file.price) > 0 ? (
                      <button
                        onClick={() => handlePurchase(file)}
                        className="btn-primary flex-1 text-sm"
                      >
                        Purchase ${file.price}
                      </button>
                    ) : (
                      <a
                        href={`https://gateway.lighthouse.storage/ipfs/${file.cid}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary flex-1 text-center text-sm"
                      >
                        Download Free
                      </a>
                    )}
                    <button className="btn-secondary text-sm px-3">
                      View
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Upload to Filecoin</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <FileUploader onUpload={handleFileUpload} />
            
            <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
              <p className="text-xs text-emerald-700">
                Files uploaded here will be stored on the Filecoin network and made available in the public store.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}