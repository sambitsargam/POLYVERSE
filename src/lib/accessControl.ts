// Simple access control contract interface with wallet integration
// In production, this would be deployed on Filecoin/Ethereum

export interface AccessControlContract {
  grantAccess(buyer: string, cid: string, paymentTxHash: string): Promise<string>
  hasAccess(user: string, cid: string): Promise<boolean>
  revokeAccess(user: string, cid: string): Promise<string>
  getAccessToken(user: string, cid: string): Promise<string | null>
}

export interface AccessToken {
  cid: string
  user: string
  grantedAt: number
  expiresAt?: number
  accessKey?: string // Generated key for decryption, not private key
  permissions: string[]
  paymentTxHash?: string
}

// Mock implementation using localStorage for demo
export class MockAccessControlContract implements AccessControlContract {
  private readonly storageKey = 'polyverse_access_tokens'

  private getTokens(): Record<string, AccessToken> {
    if (typeof window === 'undefined') return {}
    const stored = localStorage.getItem(this.storageKey)
    return stored ? JSON.parse(stored) : {}
  }

  private saveTokens(tokens: Record<string, AccessToken>) {
    if (typeof window === 'undefined') return
    localStorage.setItem(this.storageKey, JSON.stringify(tokens))
  }

  private getTokenKey(user: string, cid: string): string {
    return `${user.toLowerCase()}_${cid}`
  }

  async grantAccess(buyer: string, cid: string, paymentTxHash: string): Promise<string> {
    const tokens = this.getTokens()
    const tokenKey = this.getTokenKey(buyer, cid)
    
    const accessToken: AccessToken = {
      cid,
      user: buyer.toLowerCase(),
      grantedAt: Date.now(),
      permissions: ['download', 'decrypt'],
      accessKey: this.generateAccessKey(cid, buyer), // Generate access key for decryption
      paymentTxHash
    }
    
    tokens[tokenKey] = accessToken
    this.saveTokens(tokens)
    
    console.log(`✅ Access granted to ${buyer} for CID: ${cid} (Payment: ${paymentTxHash})`)
    return tokenKey
  }

  async hasAccess(user: string, cid: string): Promise<boolean> {
    const tokens = this.getTokens()
    const tokenKey = this.getTokenKey(user, cid)
    const token = tokens[tokenKey]
    
    if (!token) return false
    
    // Check if token is expired
    if (token.expiresAt && Date.now() > token.expiresAt) {
      delete tokens[tokenKey]
      this.saveTokens(tokens)
      return false
    }
    
    return true
  }

  async revokeAccess(user: string, cid: string): Promise<string> {
    const tokens = this.getTokens()
    const tokenKey = this.getTokenKey(user, cid)
    
    if (tokens[tokenKey]) {
      delete tokens[tokenKey]
      this.saveTokens(tokens)
      console.log(`❌ Access revoked for ${user} on CID: ${cid}`)
    }
    
    return tokenKey
  }

  async getAccessToken(user: string, cid: string): Promise<string | null> {
    const hasAccess = await this.hasAccess(user, cid)
    if (!hasAccess) return null
    
    const tokens = this.getTokens()
    const tokenKey = this.getTokenKey(user, cid)
    return JSON.stringify(tokens[tokenKey])
  }

  private generateAccessKey(cid: string, user: string): string {
    // In production, this would use proper cryptographic key derivation
    // For demo, generate a deterministic key based on CID + user
    const combined = `${cid}_${user.toLowerCase()}`
    let hash = 0
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32bit integer
    }
    return `access_${Math.abs(hash).toString(16).padStart(8, '0')}`
  }

  // Admin functions for demo
  getAllTokens(): Record<string, AccessToken> {
    return this.getTokens()
  }

  clearAllTokens(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.storageKey)
    }
  }
}

// Production implementation would interact with actual smart contract
export class EthereumAccessControlContract implements AccessControlContract {
  private contractAddress: string
  private provider: any // ethers provider
  private signer: any // ethers signer

  constructor(contractAddress: string, provider: any, signer?: any) {
    this.contractAddress = contractAddress
    this.provider = provider
    this.signer = signer
  }

  async grantAccess(buyer: string, cid: string, paymentTxHash: string): Promise<string> {
    // TODO: Implement actual contract interaction
    // const contract = new ethers.Contract(this.contractAddress, ABI, this.signer)
    // const tx = await contract.grantAccess(buyer, cid, paymentTxHash)
    // await tx.wait()
    // return tx.hash
    
    throw new Error('Not implemented - requires deployed smart contract')
  }

  async hasAccess(user: string, cid: string): Promise<boolean> {
    // TODO: Implement actual contract interaction
    // const contract = new ethers.Contract(this.contractAddress, ABI, this.provider)
    // return await contract.hasAccess(user, cid)
    
    throw new Error('Not implemented - requires deployed smart contract')
  }

  async revokeAccess(user: string, cid: string): Promise<string> {
    // TODO: Implement actual contract interaction
    throw new Error('Not implemented - requires deployed smart contract')
  }

  async getAccessToken(user: string, cid: string): Promise<string | null> {
    // TODO: Implement actual contract interaction
    throw new Error('Not implemented - requires deployed smart contract')
  }
}