'use client'

import { useState, useRef } from 'react'
import { FilecoinStorageService, type UploadProgress } from '@/lib/filecoin'
import { useWallet } from '@/lib/wallet'

interface FileUploaderProps {
  onUpload?: (result: { cid: string; size: string; name: string }) => void
  onProgress?: (progress: UploadProgress) => void
  accept?: string
  maxSize?: number
  className?: string
}

export function FileUploader({ 
  onUpload, 
  onProgress,
  accept = "*/*",
  maxSize = 100 * 1024 * 1024, // 100MB default
  className = ""
}: FileUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState<UploadProgress | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{ cid: string; size: string; name: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Get wallet context
  const { isConnected, connectWallet, provider } = useWallet()
  
  // Check for API key
  const apiKey = process.env.NEXT_PUBLIC_LIGHTHOUSE_API_KEY
  if (!apiKey) {
    console.warn('Lighthouse API key not found. Please check your environment configuration.')
  }
  
  // Use real Filecoin storage service with environment variables
  const storageService = new FilecoinStorageService(
    apiKey || '',
    process.env.NEXT_PUBLIC_GATEWAY_URL,
    provider || undefined
  )

  const handleFileSelect = async (file: File) => {
    if (!isConnected) {
      setError('Please connect your wallet first')
      return
    }

    if (file.size > maxSize) {
      setError(`File too large. Maximum size is ${(maxSize / 1024 / 1024).toFixed(1)}MB`)
      return
    }

    setIsUploading(true)
    setError(null)
    setResult(null)
    setProgress(null)

    try {
      const uploadResult = await storageService.uploadFile(
        file,
        (progressUpdate) => {
          setProgress(progressUpdate)
          onProgress?.(progressUpdate)
        }
      )

      setResult(uploadResult)
      onUpload?.(uploadResult)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed'
      setError(errorMessage)
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className={`w-full ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFileSelect(file)
        }}
        className="hidden"
      />

      <div
        onClick={openFileDialog}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className={`
          border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer
          hover:border-emerald-500 hover:bg-emerald-50 transition-colors
          ${isUploading ? 'pointer-events-none opacity-50' : ''}
        `}
      >
        {isUploading ? (
          <div className="space-y-4">
            <div className="w-12 h-12 mx-auto bg-emerald-100 rounded-full flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
            <div>
              <p className="font-medium text-gray-900">
                {progress?.message || 'Uploading...'}
              </p>
              {progress && (
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress.percentage}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {progress.percentage}% - {progress.stage}
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : result ? (
          <div className="space-y-4">
            <div className="w-12 h-12 mx-auto bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-900">Upload Complete!</p>
              <p className="text-sm text-gray-600 mt-1">
                File: {result.name} ({(parseInt(result.size) / 1024).toFixed(1)} KB)
              </p>
              <p className="text-xs text-gray-500 mt-2 font-mono break-all">
                CID: {result.cid}
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setResult(null)
                }}
                className="mt-2 text-sm text-emerald-600 hover:text-emerald-700"
              >
                Upload Another File
              </button>
            </div>
          </div>
        ) : !isConnected ? (
          <div className="space-y-4">
            <div className="w-12 h-12 mx-auto bg-yellow-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <p className="text-lg font-medium text-gray-900">Connect Wallet Required</p>
              <p className="text-sm text-gray-600">
                Connect your wallet to upload files to Filecoin
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  connectWallet()
                }}
                className="mt-3 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium"
              >
                Connect Wallet
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-12 h-12 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div>
              <p className="text-lg font-medium text-gray-900">Upload to Filecoin</p>
              <p className="text-sm text-gray-600">
                Click to browse or drag & drop files here
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Max file size: {(maxSize / 1024 / 1024).toFixed(1)}MB
              </p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-red-700">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="mt-2 text-sm text-red-600 hover:text-red-700"
          >
            Try Again
          </button>
        </div>
      )}

      {result && (
        <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
          <h4 className="font-medium text-emerald-900 mb-2">Filecoin Storage Details</h4>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium text-emerald-700">Status:</span>
              <span className="ml-2 text-emerald-600">✅ Uploaded to IPFS</span>
            </div>
            <div>
              <span className="font-medium text-emerald-700">CID:</span>
              <code className="ml-2 text-xs bg-emerald-100 px-2 py-1 rounded">{result.cid}</code>
            </div>
            <div>
              <span className="font-medium text-emerald-700">Gateway URL:</span>
              <a 
                href={storageService.getFileUrl(result.cid)}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 text-emerald-600 hover:text-emerald-700 underline text-xs"
              >
                View on IPFS Gateway
              </a>
            </div>
            <p className="text-xs text-emerald-600 mt-2">
              📦 Your file is now stored on Filecoin's decentralized network!
              <br />
              🔄 Deal status will be available in a few minutes to hours.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}