// Access Control for Polyverse Creator Platform
export interface AccessControlContract {
  grantAccess(buyer: string, cid: string, paymentTxHash: string): Promise<string>
  hasAccess(user: string, cid: string): Promise<boolean>
  revokeAccess(user: string, cid: string): Promise<string>
  getAccessKey(user: string, cid: string): Promise<string | null>
}

export interface AccessToken {
  cid: string
  user: string
  grantedAt: number
  expiresAt?: number
  accessKey?: string
  permissions: string[]
  paymentTxHash?: string
}

export class ContractAccessControl implements AccessControlContract {
  private contractService: any

  constructor(contractService?: any) {
    this.contractService = contractService
  }

  async grantAccess(buyer: string, cid: string, paymentTxHash: string): Promise<string> {
    const accessKey = this.generateAccessKey(cid, buyer)
    const accessToken: AccessToken = {
      cid,
      user: buyer,
      grantedAt: Date.now(),
      permissions: ['download', 'decrypt'],
      accessKey,
      paymentTxHash
    }

    if (typeof window !== 'undefined') {
      const storageKey = `polyverse_access_${buyer.toLowerCase()}_${cid}`
      localStorage.setItem(storageKey, JSON.stringify(accessToken))
    }

    return accessKey
  }

  async hasAccess(user: string, cid: string): Promise<boolean> {
    if (typeof window === 'undefined') return false
    
    const storageKey = `polyverse_access_${user.toLowerCase()}_${cid}`
    const tokenData = localStorage.getItem(storageKey)
    
    if (!tokenData) return false
    
    try {
      const token: AccessToken = JSON.parse(tokenData)
      
      if (token.expiresAt && token.expiresAt < Date.now()) {
        localStorage.removeItem(storageKey)
        return false
      }
      
      return true
    } catch (error) {
      console.error('Error parsing access token:', error)
      return false
    }
  }

  async revokeAccess(user: string, cid: string): Promise<string> {
    if (typeof window === 'undefined') return 'Server-side revocation not implemented'
    
    const storageKey = `polyverse_access_${user.toLowerCase()}_${cid}`
    localStorage.removeItem(storageKey)
    
    return `Access revoked for user ${user} on content ${cid}`
  }

  async getAccessKey(user: string, cid: string): Promise<string | null> {
    if (typeof window === 'undefined') return null
    
    const storageKey = `polyverse_access_${user.toLowerCase()}_${cid}`
    const tokenData = localStorage.getItem(storageKey)
    
    if (!tokenData) return null
    
    try {
      const token: AccessToken = JSON.parse(tokenData)
      return token.accessKey || null
    } catch (error) {
      console.error('Error parsing access token:', error)
      return null
    }
  }

  private generateAccessKey(cid: string, user: string): string {
    const combined = `${cid}_${user}_${Date.now()}`
    return Buffer.from(combined).toString('base64')
  }
}

export default new ContractAccessControl()
