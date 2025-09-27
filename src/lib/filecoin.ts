// Lighthouse SDK integration for Filecoin storage with wallet integration
import lighthouse from '@lighthouse-web3/sdk'

interface UploadResult {
  cid: string
  size: string
  name: string
  dealStatus?: any
}

interface UploadProgress {
  percentage: number
  stage: 'preparing' | 'uploading' | 'processing' | 'complete' | 'error'
  message: string
}

export type { UploadProgress }

interface EncryptionOptions {
  encrypt: boolean
  allowedAddresses?: string[] // For access control
}

interface WalletProvider {
  request: (args: { method: string; params?: any[] }) => Promise<any>
  selectedAddress?: string
}

export class FilecoinStorageService {
  private apiKey: string
  private gatewayUrl: string
  private walletProvider?: WalletProvider

  constructor(
    apiKey: string, 
    gatewayUrl: string = 'https://gateway.lighthouse.storage/ipfs/',
    walletProvider?: WalletProvider
  ) {
    this.apiKey = apiKey
    this.gatewayUrl = gatewayUrl
    this.walletProvider = walletProvider
  }

  /**
   * Set wallet provider for signing operations
   */
  setWalletProvider(provider: WalletProvider) {
    this.walletProvider = provider
  }

  /**
   * Upload file to Filecoin via Lighthouse
   */
  async uploadFile(
    file: File,
    onProgress?: (progress: UploadProgress) => void,
    options?: EncryptionOptions
  ): Promise<UploadResult> {
    try {
      onProgress?.({ 
        percentage: 0, 
        stage: 'preparing', 
        message: 'Preparing upload...' 
      })

      onProgress?.({ 
        percentage: 25, 
        stage: 'uploading', 
        message: 'Uploading to Filecoin...' 
      })

      let uploadResponse: any

      if (options?.encrypt && options?.allowedAddresses && this.walletProvider) {
        // Use Lighthouse encrypted upload with wallet signing
        const signAuthMessage = async (privateKey: string) => {
          if (!this.walletProvider?.selectedAddress) {
            throw new Error('Wallet not connected')
          }
          
          // Sign with wallet instead of private key
          const message = `Lighthouse Auth: ${Date.now()}`
          return this.walletProvider.request({
            method: 'personal_sign',
            params: [message, this.walletProvider.selectedAddress]
          })
        }

        uploadResponse = await lighthouse.uploadEncrypted(
          [file],
          this.apiKey,
          this.walletProvider.selectedAddress || '',
          await signAuthMessage('') // Wallet signature instead of private key
        )
      } else {
        // Standard upload using file array
        uploadResponse = await lighthouse.upload([file], this.apiKey)
      }

      onProgress?.({ 
        percentage: 75, 
        stage: 'processing', 
        message: 'Processing on Filecoin network...' 
      })

      const result: UploadResult = {
        cid: uploadResponse.data.Hash,
        size: uploadResponse.data.Size,
        name: uploadResponse.data.Name || file.name
      }

      onProgress?.({ 
        percentage: 100, 
        stage: 'complete', 
        message: 'Upload complete!' 
      })

      return result
    } catch (error) {
      onProgress?.({ 
        percentage: 0, 
        stage: 'error', 
        message: `Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
      })
      throw error
    }
  }

  /**
   * Upload data as file to Filecoin via Lighthouse
   */
  async uploadData(
    data: Uint8Array | string,
    filename: string,
    onProgress?: (progress: UploadProgress) => void,
    options?: EncryptionOptions
  ): Promise<UploadResult> {
    // Convert data to File
    let blob: Blob
    if (typeof data === 'string') {
      blob = new Blob([data], { type: 'text/plain' })
    } else {
      // Create array buffer from Uint8Array
      const buffer = new ArrayBuffer(data.length)
      const view = new Uint8Array(buffer)
      view.set(data)
      blob = new Blob([buffer], { type: 'application/octet-stream' })
    }
    
    const file = new File([blob], filename)
    return this.uploadFile(file, onProgress, options)
  }

  /**
   * Get Filecoin deal status for uploaded content
   */
  async getDealStatus(cid: string): Promise<any> {
    try {
      const status = await lighthouse.dealStatus(cid)
      return status
    } catch (error) {
      console.error('Error getting deal status:', error)
      return null
    }
  }

  /**
   * Get file from IPFS gateway
   */
  getFileUrl(cid: string): string {
    return `${this.gatewayUrl}${cid}`
  }

  /**
   * Download file from Filecoin/IPFS
   */
  async downloadFile(cid: string): Promise<Response> {
    const url = this.getFileUrl(cid)
    return fetch(url)
  }

  /**
   * Download file as bytes
   */
  async downloadFileAsBytes(cid: string): Promise<Uint8Array> {
    const response = await this.downloadFile(cid)
    const arrayBuffer = await response.arrayBuffer()
    return new Uint8Array(arrayBuffer)
  }

  /**
   * Check if content is accessible
   */
  async checkAccess(cid: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.gatewayUrl}${cid}`, { method: 'HEAD' })
      return response.ok
    } catch {
      return false
    }
  }

  /**
   * Generate deal parameters for storage
   */
  static createDealParams(options: {
    numCopies?: number
    repairThreshold?: number
    renewThreshold?: number
    miners?: string[]
    network?: 'mainnet' | 'calibration'
  } = {}) {
    return {
      num_copies: options.numCopies || 2,
      repair_threshold: options.repairThreshold || 28800,
      renew_threshold: options.renewThreshold || 240,
      miner: options.miners || [],
      network: options.network || 'calibration',
      add_metadata: 2
    }
  }
}

// Demo/Mock implementation for development
export class MockFilecoinStorageService extends FilecoinStorageService {
  constructor() {
    super('demo_key', 'https://gateway.lighthouse.storage/ipfs/')
  }

  async uploadFile(
    file: File,
    onProgress?: (progress: UploadProgress) => void,
    options?: EncryptionOptions
  ): Promise<UploadResult> {
    // Simulate upload progress
    onProgress?.({ percentage: 0, stage: 'preparing', message: 'Preparing upload...' })
    await new Promise(resolve => setTimeout(resolve, 500))
    
    onProgress?.({ percentage: 25, stage: 'uploading', message: 'Uploading to Filecoin...' })
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    onProgress?.({ percentage: 75, stage: 'processing', message: 'Processing on Filecoin network...' })
    await new Promise(resolve => setTimeout(resolve, 800))
    
    onProgress?.({ percentage: 100, stage: 'complete', message: 'Upload complete!' })
    
    // Return mock CID
    const mockCid = `bafkreig${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`
    
    return {
      cid: mockCid,
      size: file.size.toString(),
      name: file.name
    }
  }

  async getDealStatus(cid: string): Promise<any> {
    // Mock deal status
    return {
      data: [{
        dealStatus: 'Published',
        dealId: Math.floor(Math.random() * 1000000),
        miner: 'f0' + Math.floor(Math.random() * 10000),
        pieceSize: 34359738368,
        pieceCID: cid.replace('bafkrei', 'baga6ea4seaq'),
        startEpoch: Math.floor(Date.now() / 1000) - 86400,
        endEpoch: Math.floor(Date.now() / 1000) + (86400 * 365)
      }]
    }
  }
}