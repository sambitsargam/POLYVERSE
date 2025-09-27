'use client';

import { createWalletClient, http, parseUnits, type Address } from 'viem';
import { polygon } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';

// Define Polygon Amoy chain (from x402 repository)
const polygonAmoy = {
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

// X402 Configuration with real addresses from the x402 repository
const X402_CONFIG = {
  FACILITATOR_URL: process.env.NEXT_PUBLIC_X402_FACILITATOR_URL || 'https://x402.org/facilitator',
  POLYGON_RPC: process.env.NEXT_PUBLIC_POLYGON_RPC || 'https://polygon-rpc.com',
  AMOY_RPC: process.env.NEXT_PUBLIC_AMOY_RPC || 'https://rpc-amoy.polygon.technology',
  // Real USDC addresses from x402 documentation
  USDC_POLYGON: '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359', // USDC on Polygon mainnet
  USDC_AMOY: '0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582', // USDC on Polygon Amoy testnet
  RECIPIENT_ADDRESS: process.env.NEXT_PUBLIC_RECIPIENT_ADDRESS || '0xF846d2747D1cb33635Cc66dD6D513d85Cb830f13',
};

// Subscription Plans Configuration
export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number; // in USD
  duration: number; // in seconds
  features: string[];
  network: 'polygon' | 'polygon-amoy';
  isPopular?: boolean;
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'basic-weekly',
    name: 'Basic Weekly',
    description: 'Perfect for trying out premium content',
    price: 5.00,
    duration: 7 * 24 * 60 * 60, // 7 days
    features: [
      'Access to premium content',
      'Weekly content updates',
      'Community access',
      'Basic support'
    ],
    network: 'polygon-amoy'
  },
  {
    id: 'pro-monthly',
    name: 'Pro Monthly',
    description: 'For regular consumers of quality content',
    price: 15.00,
    duration: 30 * 24 * 60 * 60, // 30 days
    features: [
      'All Basic features',
      'Exclusive pro content',
      'Early access to new releases',
      'Priority support',
      'Download privileges'
    ],
    network: 'polygon-amoy',
    isPopular: true
  },
  {
    id: 'premium-yearly',
    name: 'Premium Yearly',
    description: 'Best value for power users',
    price: 120.00,
    duration: 365 * 24 * 60 * 60, // 365 days
    features: [
      'All Pro features',
      'Unlimited downloads',
      'Personal consultations',
      'Custom requests',
      '24/7 VIP support',
      'Exclusive events access'
    ],
    network: 'polygon'
  }
];

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
   * Purchase subscription using x402 protocol (needs proper client implementation)
   */
  async purchaseSubscription(plan: SubscriptionPlan, walletClient?: any): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
      // Use provided wallet client or default
      const client = walletClient || this.walletClient;
      if (!client) {
        return { success: false, error: 'Wallet not connected' };
      }

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
        // This is the expected x402 flow
        const paymentData = await response.json();
        console.log('x402 Payment Required (Polygon Amoy):', paymentData);

        // TODO: Implement real x402 client integration
        // This should:
        // 1. Create payment header using x402 client libraries
        // 2. Sign EIP-3009 TransferWithAuthorization with user's wallet
        // 3. Send X-PAYMENT header back to the API
        // 4. API verifies with facilitator and settles on-chain
        
        // For demonstration, simulate successful payment
        const mockResponse = await fetch('/api/subscriptions/purchase', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-PAYMENT': 'demo-signed-payment-header', // Mock header
          },
          body: JSON.stringify({
            planId: plan.id,
            paymentRequirements,
          }),
        });

        if (mockResponse.ok) {
          const data = await mockResponse.json();
          
          // Extract transaction hash from X-PAYMENT-RESPONSE header
          const paymentResponse = mockResponse.headers.get('X-PAYMENT-RESPONSE');
          let txHash = data.txHash;
          
          if (paymentResponse) {
            try {
              const decodedResponse = JSON.parse(atob(paymentResponse));
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
            txHash: txHash || `amoy-demo-${Date.now()}`,
            network: plan.network,
            isActive: true,
          });

          return { success: true, txHash };
        }
        
        return { success: false, error: 'x402 payment verification failed' };
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

// Singleton instance
export const x402SubscriptionService = new X402SubscriptionService(
  process.env.PRIVATE_KEY_AGENT
);

export default X402SubscriptionService;