'use client';

import { createWalletClient, http, parseUnits, type Address } from 'viem';
import { polygon, polygonMumbai } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import { wrapFetchWithPayment } from 'x402-fetch';

// X402 Configuration for Polygon
const X402_CONFIG = {
  FACILITATOR_URL: process.env.NEXT_PUBLIC_X402_FACILITATOR_URL || 'https://x402.org/facilitator',
  POLYGON_RPC: process.env.NEXT_PUBLIC_POLYGON_RPC || 'https://polygon-rpc.com',
  MUMBAI_RPC: process.env.NEXT_PUBLIC_MUMBAI_RPC || 'https://rpc-mumbai.maticvigil.com',
  USDC_POLYGON: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', // USDC on Polygon
  USDC_MUMBAI: '0xfe4f5145f6e09952a5ba9e956ed0c25e3fa4c7f1', // USDC on Amoy testnet
  RECIPIENT_ADDRESS: '0xF846d2747D1cb33635Cc66dD6D513d85Cb830f13', // Your wallet address
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
  private fetchWithPay: any;

  constructor(privateKey?: string) {
    if (privateKey && typeof window === 'undefined') {
      // Server-side initialization
      const account = privateKeyToAccount(privateKey as `0x${string}`);
      this.walletClient = createWalletClient({
        account,
        transport: http(X402_CONFIG.MUMBAI_RPC),
        chain: polygonMumbai,
      });
      this.fetchWithPay = wrapFetchWithPayment(fetch, this.walletClient);
    }
  }

  /**
   * Initialize client-side wallet connection
   */
  async initializeClientWallet(walletClient: any) {
    this.walletClient = walletClient;
    this.fetchWithPay = wrapFetchWithPayment(fetch, walletClient);
  }

  /**
   * Create payment requirements for subscription
   */
  createPaymentRequirements(plan: SubscriptionPlan) {
    const network = plan.network === 'polygon' ? 'polygon' : 'polygon-amoy';
    const usdcAddress = plan.network === 'polygon' ? X402_CONFIG.USDC_POLYGON : X402_CONFIG.USDC_MUMBAI;
    
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
   * Purchase subscription using x402 (mock implementation for demo)
   */
  async purchaseSubscription(plan: SubscriptionPlan): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
      // Mock x402 payment flow
      const response = await fetch(`/api/subscriptions/purchase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-PAYMENT': 'mock-payment-authorization', // Mock payment header
        },
        body: JSON.stringify({
          planId: plan.id,
          paymentRequirements: this.createPaymentRequirements(plan),
        }),
      });

      if (response.status === 402) {
        // Payment required - normal x402 flow
        const paymentData = await response.json();
        console.log('Payment required (demo):', paymentData);
        
        // For demo purposes, simulate successful payment after showing 402
        const mockSuccessResponse = await fetch(`/api/subscriptions/purchase`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-PAYMENT': `mock-signed-payment-${Date.now()}`,
          },
          body: JSON.stringify({
            planId: plan.id,
            paymentRequirements: this.createPaymentRequirements(plan),
          }),
        });

        if (mockSuccessResponse.ok) {
          const data = await mockSuccessResponse.json();
          
          // Store subscription locally
          this.storeSubscription({
            planId: plan.id,
            startTime: Math.floor(Date.now() / 1000),
            endTime: Math.floor(Date.now() / 1000) + plan.duration,
            txHash: data.txHash || 'mock-tx-hash',
            network: plan.network,
            isActive: true,
          });

          return { success: true, txHash: data.txHash };
        }
        
        return { success: false, error: 'Mock payment processing failed' };
      }

      if (response.ok) {
        const data = await response.json();
        
        // Extract transaction hash
        const paymentResponse = response.headers.get('X-PAYMENT-RESPONSE');
        let txHash = data.txHash;
        
        if (paymentResponse) {
          try {
            const decodedResponse = JSON.parse(atob(paymentResponse));
            txHash = decodedResponse.transaction;
          } catch (e) {
            console.warn('Could not parse payment response header');
          }
        }

        // Store subscription locally
        this.storeSubscription({
          planId: plan.id,
          startTime: Math.floor(Date.now() / 1000),
          endTime: Math.floor(Date.now() / 1000) + plan.duration,
          txHash: txHash || 'demo-tx-hash',
          network: plan.network,
          isActive: true,
        });

        return { success: true, txHash };
      }

      const errorData = await response.json();
      return { success: false, error: errorData.error || 'Payment failed' };

    } catch (error: any) {
      console.error('Subscription purchase error:', error);
      return { success: false, error: error.message || 'Failed to process payment' };
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