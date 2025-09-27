/**
 * x402 Client for Polygon Amoy Integration
 * Based on the official x402 repository specifications
 */

import { createWalletClient, http, parseUnits, type Address, getAddress, hexToBytes, keccak256, toHex } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

// Define Polygon Amoy chain (chainId: 80002)
export const polygonAmoy = {
  id: 80002,
  name: 'Polygon Amoy',
  network: 'polygon-amoy',
  nativeCurrency: { name: 'POL', symbol: 'POL', decimals: 18 },
  rpcUrls: { 
    default: { http: ['https://rpc-amoy.polygon.technology'] },
    public: { http: ['https://rpc-amoy.polygon.technology'] }
  },
  blockExplorers: { 
    default: { name: 'PolygonScan', url: 'https://amoy.polygonscan.com' } 
  },
  testnet: true,
} as const;

// x402 Types (from repository)
export interface PaymentRequirements {
  scheme: 'exact';
  network: 'polygon-amoy' | 'polygon';
  maxAmountRequired: string; // atomic units
  asset: string; // USDC contract address
  payTo: string; // recipient address
  resource: string; // API endpoint
  description: string;
  mimeType: string;
  maxTimeoutSeconds: number;
  extra?: {
    name: string; // 'USDC'
    version: string; // '2'
    [key: string]: any;
  };
}

export interface EIP3009Authorization {
  from: string;
  to: string;
  value: string;
  validAfter: string;
  validBefore: string;
  nonce: string; // bytes32
}

export interface PaymentPayload {
  x402Version: number;
  scheme: 'exact';
  network: 'polygon-amoy' | 'polygon';
  payload: {
    signature: string;
    authorization: EIP3009Authorization;
  };
}

// EIP-712 types for TransferWithAuthorization (from x402 spec)
const EIP712_DOMAIN = {
  name: 'USDC',
  version: '2',
  chainId: 80002, // Polygon Amoy
  verifyingContract: '0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582' as Address, // USDC on Amoy
};

const EIP712_TYPES = {
  TransferWithAuthorization: [
    { name: 'from', type: 'address' },
    { name: 'to', type: 'address' },
    { name: 'value', type: 'uint256' },
    { name: 'validAfter', type: 'uint256' },
    { name: 'validBefore', type: 'uint256' },
    { name: 'nonce', type: 'bytes32' },
  ],
} as const;

/**
 * x402 Client for creating payment headers
 */
export class X402Client {
  private walletClient: any;
  
  constructor(privateKey: string) {
    const account = privateKeyToAccount(privateKey as `0x${string}`);
    this.walletClient = createWalletClient({
      account,
      transport: http('https://rpc-amoy.polygon.technology'),
      chain: polygonAmoy,
    });
  }

  /**
   * Create a random nonce for payment authorization
   */
  private createNonce(): string {
    const randomBytes = new Uint8Array(32);
    crypto.getRandomValues(randomBytes);
    return toHex(randomBytes);
  }

  /**
   * Create and sign x402 payment header following the specification
   */
  async createPaymentHeader(paymentRequirements: PaymentRequirements, fromAddress: Address): Promise<string> {
    try {
      const now = Math.floor(Date.now() / 1000);
      const nonce = this.createNonce();

      // Create EIP-3009 authorization
      const authorization: EIP3009Authorization = {
        from: getAddress(fromAddress),
        to: getAddress(paymentRequirements.payTo as Address),
        value: paymentRequirements.maxAmountRequired,
        validAfter: (now - 60).toString(), // valid from 1 minute ago
        validBefore: (now + paymentRequirements.maxTimeoutSeconds).toString(),
        nonce: nonce,
      };

      // Sign the authorization using EIP-712
      const signature = await this.walletClient.signTypedData({
        domain: {
          ...EIP712_DOMAIN,
          verifyingContract: getAddress(paymentRequirements.asset as Address),
        },
        types: EIP712_TYPES,
        primaryType: 'TransferWithAuthorization',
        message: {
          from: getAddress(authorization.from),
          to: getAddress(authorization.to),
          value: BigInt(authorization.value),
          validAfter: BigInt(authorization.validAfter),
          validBefore: BigInt(authorization.validBefore),
          nonce: authorization.nonce as `0x${string}`,
        },
      });

      // Create x402 payment payload
      const paymentPayload: PaymentPayload = {
        x402Version: 1,
        scheme: 'exact',
        network: paymentRequirements.network,
        payload: {
          signature,
          authorization,
        },
      };

      // Encode as base64 (x402 standard)
      const paymentHeader = Buffer.from(JSON.stringify(paymentPayload)).toString('base64');
      
      console.log('x402 Payment Header created for Polygon Amoy:', {
        network: paymentRequirements.network,
        asset: paymentRequirements.asset,
        amount: paymentRequirements.maxAmountRequired,
        from: authorization.from,
        to: authorization.to,
        nonce: authorization.nonce,
      });

      return paymentHeader;
      
    } catch (error) {
      console.error('Failed to create x402 payment header:', error);
      throw new Error(`x402 payment header creation failed: ${error}`);
    }
  }

  /**
   * Decode payment header for verification
   */
  static decodePaymentHeader(paymentHeader: string): PaymentPayload {
    try {
      const decoded = Buffer.from(paymentHeader, 'base64').toString('utf-8');
      return JSON.parse(decoded);
    } catch (error) {
      throw new Error('Invalid x402 payment header format');
    }
  }

  /**
   * Get wallet address
   */
  getAddress(): Address {
    return this.walletClient.account.address;
  }
}

/**
 * x402 Facilitator Client for verification and settlement
 */
export class X402Facilitator {
  private facilitatorUrl: string;

  constructor(facilitatorUrl: string = 'https://x402.org/facilitator') {
    this.facilitatorUrl = facilitatorUrl;
  }

  /**
   * Verify payment with facilitator
   */
  async verify(paymentHeader: string, paymentRequirements: PaymentRequirements) {
    try {
      const response = await fetch(`${this.facilitatorUrl}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          x402Version: 1,
          paymentPayload: X402Client.decodePaymentHeader(paymentHeader),
          paymentRequirements,
        }),
      });

      return await response.json();
    } catch (error) {
      console.error('x402 facilitator verification failed:', error);
      return { isValid: false, invalidReason: 'facilitator_error' };
    }
  }

  /**
   * Settle payment with facilitator
   */
  async settle(paymentHeader: string, paymentRequirements: PaymentRequirements) {
    try {
      const response = await fetch(`${this.facilitatorUrl}/settle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          x402Version: 1,
          paymentPayload: X402Client.decodePaymentHeader(paymentHeader),
          paymentRequirements,
        }),
      });

      return await response.json();
    } catch (error) {
      console.error('x402 facilitator settlement failed:', error);
      return { success: false, errorReason: 'facilitator_error' };
    }
  }
}

// Export default instances
export const x402Client = new X402Client(
  process.env.PRIVATE_KEY_AGENT || '0x0000000000000000000000000000000000000000000000000000000000000001'
);

export const x402Facilitator = new X402Facilitator(
  process.env.X402_FACILITATOR_URL || 'https://x402.org/facilitator'
);