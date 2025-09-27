'use client';

import { createWalletClient, http, parseUnits, type Address } from 'viem';
import { polygon } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import { polygonAmoy } from './wallet-config';
import { type SubscriptionPlan, SUBSCRIPTION_PLANS } from './subscription-plans';

// X402 Configuration with official Polygon facilitator
const X402_CONFIG = {
  FACILITATOR_URL: process.env.NEXT_PUBLIC_X402_FACILITATOR_URL || 'https://x402.polygon.technology',
  POLYGON_RPC: process.env.NEXT_PUBLIC_POLYGON_RPC || 'https://polygon-rpc.com',
  AMOY_RPC: process.env.NEXT_PUBLIC_AMOY_RPC || 'https://rpc-amoy.polygon.technology',
  // Real USDC addresses from x402 documentation
  USDC_POLYGON: '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359', // USDC on Polygon mainnet
  USDC_AMOY: '0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582', // USDC on Polygon Amoy testnet
  RECIPIENT_ADDRESS: process.env.NEXT_PUBLIC_RECIPIENT_ADDRESS || '0x90D9CD66FAdFF1C2Ba32C99A47C76532d08A704B',
};

// Subscription Management
interface ActiveSubscription {
  planId: string;
  startTime: number;
  endTime: number;
  txHash: string;
  network: string;
  isActive: boolean;
}

class X402SubscriptionService {
  private walletClient: any;

  constructor(privateKey?: string) {
    if (privateKey && typeof window === 'undefined') {
      // Server-side initialization with Polygon Amoy
      const account = privateKeyToAccount(privateKey as `0x${string}`);
      this.walletClient = createWalletClient({
        account,
        transport: http(X402_CONFIG.AMOY_RPC),
        chain: polygonAmoy,
      });
    }
  }

  /**
   * Initialize client-side wallet connection
   */
  async initializeClientWallet(walletClient: any) {
    this.walletClient = walletClient;
  }

  /**
   * Create x402 payment requirements following the official specification
   */
  createPaymentRequirements(plan: SubscriptionPlan) {
    const network = plan.network === 'polygon' ? 'polygon' : 'polygon-amoy';
    const usdcAddress = plan.network === 'polygon' ? X402_CONFIG.USDC_POLYGON : X402_CONFIG.USDC_AMOY;
    
    // Convert USD to USDC atomic units (6 decimals for USDC)
    const amountUsdc = parseUnits(plan.price.toString(), 6);

    return {
      scheme: 'exact' as const,
      network,
      maxAmountRequired: amountUsdc.toString(),
      asset: usdcAddress,
      payTo: X402_CONFIG.RECIPIENT_ADDRESS,
      resource: `/api/subscriptions/activate/${plan.id}`,
      description: `Subscription: ${plan.name} - ${plan.description}`,
      mimeType: 'application/json',
      maxTimeoutSeconds: 300, // 5 minutes
      extra: {
        name: 'USDC',
        version: '2',
        subscriptionPlan: plan.id,
        duration: plan.duration,
      }
    };
  }

  /**
   * Create user payment header using EIP-3009 TransferWithAuthorization
   */
  async createUserPaymentHeader(
    plan: SubscriptionPlan, 
    userAddress: string, 
    walletClient: any
  ): Promise<string | null> {
    try {
      // Ensure we're on the correct network (Polygon Amoy for subscriptions)
      const targetChainId = 80002; // Polygon Amoy
      
      // Check if user needs to switch chains
      const currentChainId = await walletClient.getChainId();
      if (currentChainId !== targetChainId) {
        console.log('Switching to Polygon Amoy for x402 payment...');
        try {
          await walletClient.switchChain({ id: targetChainId });
        } catch (switchError: any) {
          console.error('Failed to switch to Polygon Amoy:', switchError);
          throw new Error('Please switch to Polygon Amoy network to complete payment');
        }
      }

      const network = plan.network === 'polygon' ? 'polygon' : 'polygon-amoy';
      const usdcAddress = plan.network === 'polygon' ? X402_CONFIG.USDC_POLYGON : X402_CONFIG.USDC_AMOY;
      const amountUsdc = parseUnits(plan.price.toString(), 6);

      // Generate a unique nonce for this transaction
      const nonce = crypto.getRandomValues(new Uint8Array(32));
      const validAfter = Math.floor(Date.now() / 1000) - 60; // 1 minute ago
      const validBefore = validAfter + 3600; // Valid for 1 hour

      // EIP-712 domain for USDC contract on Polygon Amoy
      const domain = {
        name: 'USD Coin',
        version: '2',
        chainId: targetChainId,
        verifyingContract: usdcAddress as Address,
      };

      // EIP-3009 TransferWithAuthorization type definition
      const types = {
        TransferWithAuthorization: [
          { name: 'from', type: 'address' },
          { name: 'to', type: 'address' },
          { name: 'value', type: 'uint256' },
          { name: 'validAfter', type: 'uint256' },
          { name: 'validBefore', type: 'uint256' },
          { name: 'nonce', type: 'bytes32' },
        ],
      };

      const message = {
        from: userAddress as Address,
        to: X402_CONFIG.RECIPIENT_ADDRESS as Address,
        value: amountUsdc,
        validAfter: BigInt(validAfter),
        validBefore: BigInt(validBefore),
        nonce: `0x${Array.from(nonce, byte => byte.toString(16).padStart(2, '0')).join('')}` as `0x${string}`,
      };

      console.log('Signing EIP-3009 TransferWithAuthorization:', {
        domain,
        message,
        usdcAddress,
        amountUsdc: amountUsdc.toString()
      });

      // Request user signature via wallet
      const signature = await walletClient.signTypedData({
        account: userAddress as Address,
        domain,
        types,
        primaryType: 'TransferWithAuthorization',
        message,
      });

      // Create x402 payment header
      const paymentData = {
        scheme: 'exact',
        network,
        asset: usdcAddress,
        amount: amountUsdc.toString(),
        payTo: X402_CONFIG.RECIPIENT_ADDRESS,
        signature,
        authorization: {
          from: userAddress,
          to: X402_CONFIG.RECIPIENT_ADDRESS,
          value: amountUsdc.toString(),
          validAfter: validAfter.toString(),
          validBefore: validBefore.toString(),
          nonce: message.nonce,
        },
        timestamp: Date.now(),
      };

      // Encode as base64 for X-PAYMENT header
      const paymentHeader = btoa(JSON.stringify(paymentData));
      console.log('Created x402 payment header for Polygon Amoy:', paymentHeader.substring(0, 100) + '...');
      
      return paymentHeader;

    } catch (error: any) {
      console.error('Error creating user payment header:', error);
      throw new Error(error.message || 'Failed to create payment authorization');
    }
  }

  /**
   * Purchase subscription using x402 protocol with real blockchain transactions
   */
  async purchaseSubscription(plan: SubscriptionPlan, walletClient?: any): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
      // Use provided wallet client or default
      const client = walletClient || this.walletClient;
      if (!client) {
        return { success: false, error: 'Wallet not connected' };
      }

      // Get user address
      const accounts = await client.getAddresses();
      if (!accounts || accounts.length === 0) {
        return { success: false, error: 'No wallet accounts found' };
      }
      const userAddress = accounts[0];

      // Create x402-compliant payment requirements
      const paymentRequirements = this.createPaymentRequirements(plan);
      console.log('x402 Payment Requirements (Polygon Amoy):', paymentRequirements);

      // Step 1: Make initial request (should return 402)
      const response = await fetch('/api/subscriptions/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: plan.id,
          paymentRequirements,
        }),
      });

      if (response.status === 402) {
        // This is the expected x402 flow - create real payment header
        const paymentData = await response.json();
        console.log('x402 Payment Required (Polygon Amoy):', paymentData);

        try {
          // Create real payment header with user signature
          const paymentHeader = await this.createUserPaymentHeader(plan, userAddress, client);
          if (!paymentHeader) {
            return { success: false, error: 'Failed to create payment authorization' };
          }

          // Send payment header back to API for verification and settlement
          const paymentResponse = await fetch('/api/subscriptions/purchase', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-PAYMENT': paymentHeader,
            },
            body: JSON.stringify({
              planId: plan.id,
              paymentRequirements,
            }),
          });

          if (paymentResponse.ok) {
            const data = await paymentResponse.json();
            
            // Extract transaction hash from X-PAYMENT-RESPONSE header
            const paymentResponseHeader = paymentResponse.headers.get('X-PAYMENT-RESPONSE');
            let txHash = data.txHash;
            
            if (paymentResponseHeader) {
              try {
                const decodedResponse = JSON.parse(atob(paymentResponseHeader));
                txHash = decodedResponse.transaction;
                console.log('x402 Settlement Transaction (Polygon Amoy):', txHash);
              } catch (e) {
                console.warn('Could not parse X-PAYMENT-RESPONSE header');
              }
            }

            // Store subscription locally
            this.storeSubscription({
              planId: plan.id,
              startTime: Math.floor(Date.now() / 1000),
              endTime: Math.floor(Date.now() / 1000) + plan.duration,
              txHash: txHash || `real-tx-${Date.now()}`,
              network: plan.network || 'polygon-amoy',
              isActive: true,
            });

            return { success: true, txHash };
          } else {
            const errorData = await paymentResponse.json();
            return { success: false, error: errorData.error || 'x402 payment verification failed' };
          }

        } catch (authError: any) {
          console.error('x402 Payment authorization error:', authError);
          return { success: false, error: authError.message || 'Payment authorization failed' };
        }
      }

      if (response.ok) {
        // Unexpected success without payment - should not happen in x402
        const data = await response.json();
        return { success: true, txHash: data.txHash };
      }

      const errorData = await response.json();
      return { success: false, error: errorData.error || 'x402 payment processing failed' };

    } catch (error: any) {
      console.error('x402 Subscription purchase error:', error);
      return { success: false, error: error.message || 'Failed to process x402 payment' };
    }
  }

  /**
   * Get active subscriptions
   */
  getActiveSubscriptions(): ActiveSubscription[] {
    if (typeof window === 'undefined') return [];
    
    const stored = localStorage.getItem('polyverse_subscriptions');
    if (!stored) return [];

    try {
      const subscriptions: ActiveSubscription[] = JSON.parse(stored);
      const now = Math.floor(Date.now() / 1000);
      
      return subscriptions.filter(sub => sub.endTime > now && sub.isActive);
    } catch (error) {
      console.error('Error loading subscriptions:', error);
      return [];
    }
  }

  /**
   * Store subscription locally
   */
  private storeSubscription(subscription: ActiveSubscription) {
    if (typeof window === 'undefined') return;

    const existing = this.getAllSubscriptions();
    existing.push(subscription);
    
    localStorage.setItem('polyverse_subscriptions', JSON.stringify(existing));
  }

  /**
   * Get all subscriptions (active and expired)
   */
  getAllSubscriptions(): ActiveSubscription[] {
    if (typeof window === 'undefined') return [];
    
    const stored = localStorage.getItem('polyverse_subscriptions');
    if (!stored) return [];

    try {
      return JSON.parse(stored);
    } catch (error) {
      console.error('Error loading all subscriptions:', error);
      return [];
    }
  }

  /**
   * Cancel subscription
   */
  cancelSubscription(planId: string): boolean {
    if (typeof window === 'undefined') return false;

    const subscriptions = this.getAllSubscriptions();
    const updated = subscriptions.map(sub => 
      sub.planId === planId ? { ...sub, isActive: false } : sub
    );

    localStorage.setItem('polyverse_subscriptions', JSON.stringify(updated));
    return true;
  }

  /**
   * Check if user has active subscription
   */
  hasActiveSubscription(planId?: string): boolean {
    const active = this.getActiveSubscriptions();
    if (planId) {
      return active.some(sub => sub.planId === planId);
    }
    return active.length > 0;
  }

  /**
   * Get subscription status
   */
  getSubscriptionStatus(planId: string): 'active' | 'expired' | 'none' {
    const all = this.getAllSubscriptions();
    const subscription = all.find(sub => sub.planId === planId);
    
    if (!subscription) return 'none';
    
    const now = Math.floor(Date.now() / 1000);
    if (subscription.endTime > now && subscription.isActive) {
      return 'active';
    }
    
    return 'expired';
  }
}

// Singleton instance with environment private key for server-side operations
export const x402SubscriptionService = new X402SubscriptionService(
  typeof window === 'undefined' ? process.env.PRIVATE_KEY_AGENT : undefined
);

// Export subscription plans
export { SUBSCRIPTION_PLANS };

export default X402SubscriptionService;