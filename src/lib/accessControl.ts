// Access Control for Polyverse Creator Platform// Access Control for Polyverse Creator Platform// Simple access control contract interface with wallet integration

export interface AccessControlContract {

  grantAccess(buyer: string, cid: string, paymentTxHash: string): Promise<string>// Manages content access permissions and encryption keys// In production, this would be deployed on Filecoin/Ethereum

  hasAccess(user: string, cid: string): Promise<boolean>

  revokeAccess(user: string, cid: string): Promise<string>

  getAccessKey(user: string, cid: string): Promise<string | null>

}export interface AccessControlContract {export interface AccessControlContract {



export interface AccessToken {  grantAccess(buyer: string, cid: string, paymentTxHash: string): Promise<string>  grantAccess(buyer: string, cid: string, paymentTxHash: string): Promise<string>

  cid: string

  user: string  hasAccess(user: string, cid: string): Promise<boolean>  hasAccess(user: string, cid: string): Promise<boolean>

  grantedAt: number

  expiresAt?: number  revokeAccess(user: string, cid: string): Promise<string>  revokeAccess(user: string, cid: string): Promise<string>

  accessKey?: string

  permissions: string[]  getAccessKey(user: string, cid: string): Promise<string | null>  getAccessToken(user: string, cid: string): Promise<string | null>

  paymentTxHash?: string

}}}



export class ContractAccessControl implements AccessControlContract {

  private contractService: any

export interface AccessToken {export interface AccessToken {

  constructor(contractService?: any) {

    this.contractService = contractService;  cid: string  cid: string

  }

  user: string  user: string

  async grantAccess(buyer: string, cid: string, paymentTxHash: string): Promise<string> {

    const accessKey = this.generateAccessKey(cid, buyer);  grantedAt: number  grantedAt: number

    

    const accessToken: AccessToken = {  expiresAt?: number  expiresAt?: number

      cid,

      user: buyer.toLowerCase(),  accessKey?: string // Generated key for decryption  accessKey?: string // Generated key for decryption

      grantedAt: Date.now(),

      permissions: ['download', 'decrypt'],  permissions: string[]  permissions: string[]

      accessKey,

      paymentTxHash  paymentTxHash?: string  paymentTxHash?: string

    };

}}

    if (typeof window !== 'undefined') {

      const storageKey = `polyverse_access_${buyer.toLowerCase()}_${cid}`;

      localStorage.setItem(storageKey, JSON.stringify(accessToken));

    }// Real implementation using smart contract and decentralized storage// Real implementation using smart contract



    return accessKey;export class ContractAccessControl implements AccessControlContract {export class ContractAccessControl implements AccessControlContract {

  }

  private contractService: any  private contractService: any // Import contract service

  async hasAccess(user: string, cid: string): Promise<boolean> {

    if (typeof window === 'undefined') return false;

    

    const storageKey = `polyverse_access_${user.toLowerCase()}_${cid}`;  constructor(contractService: any) {  constructor(contractService: any) {

    const stored = localStorage.getItem(storageKey);

        this.contractService = contractService;    this.contractService = contractService;

    if (!stored) return false;

      }  }

    const token: AccessToken = JSON.parse(stored);

    

    if (token.expiresAt && Date.now() > token.expiresAt) {

      localStorage.removeItem(storageKey);  async grantAccess(buyer: string, cid: string, paymentTxHash: string): Promise<string> {  async grantAccess(buyer: string, cid: string, paymentTxHash: string): Promise<string> {

      return false;

    }    try {    // Check if user has purchased access via smart contract



    return true;      // Verify payment through smart contract    try {

  }

      // const hasPayment = await this.contractService.checkProductAccess(buyer, productId);      // This would verify payment through the contract

  async revokeAccess(user: string, cid: string): Promise<string> {

    if (typeof window !== 'undefined') {            const accessKey = this.generateAccessKey(cid, buyer);

      const storageKey = `polyverse_access_${user.toLowerCase()}_${cid}`;

      localStorage.removeItem(storageKey);      const accessKey = this.generateAccessKey(cid, buyer);      

    }

                // Store access record on-chain or in decentralized storage

    return 'Access revoked';

  }      const accessToken: AccessToken = {      // For now, we'll use a hybrid approach with local storage for UI state



  async getAccessKey(user: string, cid: string): Promise<string | null> {        cid,      const accessToken: AccessToken = {

    if (typeof window === 'undefined') return null;

            user: buyer.toLowerCase(),        cid,

    const storageKey = `polyverse_access_${user.toLowerCase()}_${cid}`;

    const stored = localStorage.getItem(storageKey);        grantedAt: Date.now(),        user: buyer.toLowerCase(),

    

    if (!stored) return null;        permissions: ['download', 'decrypt'],        grantedAt: Date.now(),

    

    const token: AccessToken = JSON.parse(stored);        accessKey,        permissions: ['download', 'decrypt'],

    return token.accessKey || null;

  }        paymentTxHash        accessKey,



  private generateAccessKey(cid: string, buyer: string): string {      };        paymentTxHash

    const combined = `${cid}:${buyer.toLowerCase()}:${Date.now()}`;

    return btoa(combined).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);      };

  }

}      // Store access record (in production, this would be on-chain or IPFS)



export const accessControl = new ContractAccessControl();      if (typeof window !== 'undefined') {      // In production, this would be stored on-chain or IPFS

        const storageKey = `polyverse_access_${buyer.toLowerCase()}_${cid}`;      if (typeof window !== 'undefined') {

        localStorage.setItem(storageKey, JSON.stringify(accessToken));        const storageKey = `polyverse_access_${buyer.toLowerCase()}_${cid}`;

      }        localStorage.setItem(storageKey, JSON.stringify(accessToken));

      }

      return accessKey;

    } catch (error) {      return accessKey;

      throw new Error(`Failed to grant access: ${error instanceof Error ? error.message : 'Unknown error'}`);    } catch (error) {

    }      throw new Error(`Failed to grant access: ${error instanceof Error ? error.message : 'Unknown error'}`);

  }    }

  }

  async hasAccess(user: string, cid: string): Promise<boolean> {    }

    try {    

      if (typeof window === 'undefined') return false;    tokens[tokenKey] = accessToken

          this.saveTokens(tokens)

      const storageKey = `polyverse_access_${user.toLowerCase()}_${cid}`;    

      const stored = localStorage.getItem(storageKey);    console.log(`✅ Access granted to ${buyer} for CID: ${cid} (Payment: ${paymentTxHash})`)

          return tokenKey

      if (!stored) return false;  }

      

      const token: AccessToken = JSON.parse(stored);  async hasAccess(user: string, cid: string): Promise<boolean> {

          const tokens = this.getTokens()

      // Check if token is expired    const tokenKey = this.getTokenKey(user, cid)

      if (token.expiresAt && Date.now() > token.expiresAt) {    const token = tokens[tokenKey]

        localStorage.removeItem(storageKey);    

        return false;    if (!token) return false

      }    

    // Check if token is expired

      return true;    if (token.expiresAt && Date.now() > token.expiresAt) {

    } catch (error) {      delete tokens[tokenKey]

      console.error('Error checking access:', error);      this.saveTokens(tokens)

      return false;      return false

    }    }

  }    

    return true

  async revokeAccess(user: string, cid: string): Promise<string> {  }

    try {

      if (typeof window !== 'undefined') {  async revokeAccess(user: string, cid: string): Promise<string> {

        const storageKey = `polyverse_access_${user.toLowerCase()}_${cid}`;    const tokens = this.getTokens()

        localStorage.removeItem(storageKey);    const tokenKey = this.getTokenKey(user, cid)

      }    

          if (tokens[tokenKey]) {

      // In production, this would revoke access on-chain      delete tokens[tokenKey]

      return 'Access revoked successfully';      this.saveTokens(tokens)

    } catch (error) {      console.log(`❌ Access revoked for ${user} on CID: ${cid}`)

      throw new Error(`Failed to revoke access: ${error instanceof Error ? error.message : 'Unknown error'}`);    }

    }    

  }    return tokenKey

  }

  async getAccessKey(user: string, cid: string): Promise<string | null> {

    try {  async getAccessToken(user: string, cid: string): Promise<string | null> {

      if (typeof window === 'undefined') return null;    const hasAccess = await this.hasAccess(user, cid)

          if (!hasAccess) return null

      const storageKey = `polyverse_access_${user.toLowerCase()}_${cid}`;    

      const stored = localStorage.getItem(storageKey);    const tokens = this.getTokens()

          const tokenKey = this.getTokenKey(user, cid)

      if (!stored) return null;    return JSON.stringify(tokens[tokenKey])

        }

      const token: AccessToken = JSON.parse(stored);

      return token.accessKey || null;  private generateAccessKey(cid: string, user: string): string {

    } catch (error) {    // In production, this would use proper cryptographic key derivation

      console.error('Error getting access key:', error);    // For demo, generate a deterministic key based on CID + user

      return null;    const combined = `${cid}_${user.toLowerCase()}`

    }    let hash = 0

  }    for (let i = 0; i < combined.length; i++) {

      const char = combined.charCodeAt(i)

  private generateAccessKey(cid: string, buyer: string): string {      hash = ((hash << 5) - hash) + char

    // Generate a deterministic access key based on CID + user      hash = hash & hash // Convert to 32bit integer

    const combined = `${cid}:${buyer.toLowerCase()}:${Date.now()}`;    }

    const encoder = new TextEncoder();    return `access_${Math.abs(hash).toString(16).padStart(8, '0')}`

    const data = encoder.encode(combined);  }

    

    // Simple hash for demo (in production, use proper cryptographic methods)  // Admin functions for demo

    let hash = 0;  getAllTokens(): Record<string, AccessToken> {

    for (let i = 0; i < data.length; i++) {    return this.getTokens()

      const char = data[i];  }

      hash = ((hash << 5) - hash) + char;

      hash = hash & hash; // Convert to 32-bit integer  clearAllTokens(): void {

    }    if (typeof window !== 'undefined') {

          localStorage.removeItem(this.storageKey)

    return Math.abs(hash).toString(16).padStart(16, '0');    }

  }  }

}}



// Factory function to create access control instance// Production implementation would interact with actual smart contract

export function createAccessControl(contractService?: any): AccessControlContract {export class EthereumAccessControlContract implements AccessControlContract {

  return new ContractAccessControl(contractService);  private contractAddress: string

}  private provider: any // ethers provider

  private signer: any // ethers signer

// Default instance

export const accessControl = createAccessControl();  constructor(contractAddress: string, provider: any, signer?: any) {
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