import { Address, createWalletClient, http, publicActions, parseEther, formatEther } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { polygonAmoy } from 'viem/chains';

// x402 Types based on the protocol specification
export interface PaymentRequirements {
  scheme: 'exact';
  network: 'polygon-amoy';
  payTo: Address;
  asset: Address; // USDC on Polygon Amoy
  maxAmountRequired: string; // Amount in wei/atomic units
  resource: string;
  description: string;
  mimeType: string;
  maxTimeoutSeconds: number;
  extra?: {
    name: string;
    version: string;
  };
}

export interface PaymentPayload {
  x402Version: number;
  scheme: 'exact';
  network: 'polygon-amoy';
  payload: {
    signature: string;
    authorization: {
      from: Address;
      to: Address;
      value: string;
      validAfter: string;
      validBefore: string;
      nonce: string;
    };
  };
}

export interface VerifyResponse {
  isValid: boolean;
  invalidReason?: string;
}

export interface SettleResponse {
  success: boolean;
  errorReason?: string;
  transaction?: string;
  network: string;
  payer: Address;
}

export interface SubscriptionPlan {
  id: string;
  creatorId: string;
  name: string;
  description: string;
  priceUSD: number;
  interval: 'monthly' | 'weekly' | 'daily';
  intervalCount: number; // e.g., every 2 weeks
  paymentAsset: Address;
  createdAt: Date;
  isActive: boolean;
}

export interface SubscriptionState {
  id: string;
  planId: string;
  subscriberId: Address;
  creatorId: string;
  status: 'active' | 'paused' | 'cancelled' | 'expired';
  nextPaymentDate: Date;
  lastPaymentDate?: Date;
  lastPaymentTxHash?: string;
  totalPaid: string;
  failedPayments: number;
  createdAt: Date;
}

export interface AgentPaymentEvent {
  id: string;
  subscriptionId: string;
  amount: string;
  txHash?: string;
  status: 'pending' | 'completed' | 'failed';
  scheduledFor: Date;
  processedAt?: Date;
  failureReason?: string;
}

// Polygon Amoy testnet configuration
export const POLYGON_AMOY_CONFIG = {
  chainId: 80002,
  rpc: process.env.POLYGON_AMOY_RPC || 'https://rpc-amoy.polygon.technology',
  usdcAddress: '0x41e94eb019c0762f9bfcf9fb1e58725bfb0e7582' as Address, // USDC on Polygon Amoy
  facilitatorUrl: process.env.X402_FACILITATOR_URL || 'https://x402.org/facilitator',
};

export class X402Service {
  private facilitatorUrl: string;
  private walletClient?: ReturnType<typeof createWalletClient>;

  constructor() {
    this.facilitatorUrl = POLYGON_AMOY_CONFIG.facilitatorUrl;
    this.initializeWallet();
  }

  private initializeWallet() {
    const privateKey = process.env.PRIVATE_KEY_AGENT as `0x${string}`;
    if (!privateKey) {
      console.warn('No agent private key provided. Agent payment simulation only.');
      return;
    }

    try {
      const account = privateKeyToAccount(privateKey);
      this.walletClient = createWalletClient({
        account,
        chain: polygonAmoy,
        transport: http(POLYGON_AMOY_CONFIG.rpc),
      }).extend(publicActions);
      console.log('✅ x402 Agent wallet initialized:', account.address);
    } catch (error) {
      console.error('❌ Failed to initialize agent wallet:', error);
    }
  }

  /**
   * Create payment requirements for a subscription
   */
  createPaymentRequirements(
    subscription: SubscriptionPlan,
    creatorAddress: Address,
    resource: string
  ): PaymentRequirements {
    // Convert USD to USDC (assuming 1:1 parity)
    const amountUSDC = subscription.priceUSD;
    const amountWei = (amountUSDC * 1e6).toString(); // USDC has 6 decimals

    return {
      scheme: 'exact',
      network: 'polygon-amoy',
      payTo: creatorAddress,
      asset: POLYGON_AMOY_CONFIG.usdcAddress,
      maxAmountRequired: amountWei,
      resource,
      description: `Subscription to ${subscription.name} - ${subscription.interval}ly payment`,
      mimeType: 'application/json',
      maxTimeoutSeconds: 300,
      extra: {
        name: 'USDC',
        version: '2',
      },
    };
  }

  /**
   * Verify payment with facilitator (or simulate if no real facilitator)
   */
  async verifyPayment(
    paymentPayload: PaymentPayload,
    paymentRequirements: PaymentRequirements
  ): Promise<VerifyResponse> {
    try {
      // TODO: Replace with real x402 facilitator integration
      // For now, simulate verification
      console.log('🔍 Simulating payment verification:', {
        amount: paymentRequirements.maxAmountRequired,
        payTo: paymentRequirements.payTo,
        from: paymentPayload.payload.authorization.from,
      });

      // Simulate verification logic
      const isValid = paymentPayload.payload.authorization.value >= paymentRequirements.maxAmountRequired;

      return {
        isValid,
        invalidReason: isValid ? undefined : 'Insufficient payment amount',
      };
    } catch (error) {
      console.error('❌ Payment verification failed:', error);
      return {
        isValid: false,
        invalidReason: 'Verification service error',
      };
    }
  }

  /**
   * Settle payment with facilitator (or simulate if no real facilitator)
   */
  async settlePayment(
    paymentPayload: PaymentPayload,
    paymentRequirements: PaymentRequirements
  ): Promise<SettleResponse> {
    try {
      // TODO: Replace with real x402 facilitator integration
      // For now, simulate settlement
      console.log('💰 Simulating payment settlement:', {
        amount: paymentRequirements.maxAmountRequired,
        payTo: paymentRequirements.payTo,
        from: paymentPayload.payload.authorization.from,
      });

      // Simulate settlement with mock transaction hash
      const mockTxHash = `0x${Date.now().toString(16).padStart(64, '0')}`;

      return {
        success: true,
        transaction: mockTxHash,
        network: 'polygon-amoy',
        payer: paymentPayload.payload.authorization.from,
      };
    } catch (error) {
      console.error('❌ Payment settlement failed:', error);
      return {
        success: false,
        errorReason: 'Settlement service error',
        network: 'polygon-amoy',
        payer: paymentPayload.payload.authorization.from,
      };
    }
  }

  /**
   * Simulate agent-triggered recurring payment
   */
  async simulateAgentPayment(
    subscription: SubscriptionState,
    plan: SubscriptionPlan,
    creatorAddress: Address
  ): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
      if (!this.walletClient) {
        // Simulate without real wallet
        console.log('🤖 Agent simulating payment (no wallet configured):', {
          subscriptionId: subscription.id,
          amount: plan.priceUSD,
          creator: creatorAddress,
        });

        const mockTxHash = `0xagent${Date.now().toString(16).padStart(60, '0')}`;
        return { success: true, txHash: mockTxHash };
      }

      // Real agent payment using wallet (if configured)
      console.log('🤖 Agent processing real payment:', {
        subscriptionId: subscription.id,
        amount: plan.priceUSD,
        creator: creatorAddress,
      });

      // For real implementation, this would:
      // 1. Check USDC balance
      // 2. Create and sign USDC transfer transaction
      // 3. Send to network
      // 4. Wait for confirmation

      // Simulated transaction for demo
      const mockTxHash = `0xreal${Date.now().toString(16).padStart(60, '0')}`;
      
      return { success: true, txHash: mockTxHash };
    } catch (error) {
      console.error('❌ Agent payment failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Calculate next payment date based on interval
   */
  calculateNextPaymentDate(lastPayment: Date, interval: string, count: number = 1): Date {
    const next = new Date(lastPayment);
    
    switch (interval) {
      case 'daily':
        next.setDate(next.getDate() + count);
        break;
      case 'weekly':
        next.setDate(next.getDate() + (7 * count));
        break;
      case 'monthly':
        next.setMonth(next.getMonth() + count);
        break;
      default:
        next.setMonth(next.getMonth() + 1);
    }

    return next;
  }

  /**
   * Get facilitator status (check if real facilitator is available)
   */
  async getFacilitatorStatus(): Promise<{ available: boolean; url: string }> {
    try {
      const response = await fetch(`${this.facilitatorUrl}/supported`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      return {
        available: response.ok,
        url: this.facilitatorUrl,
      };
    } catch (error) {
      return {
        available: false,
        url: this.facilitatorUrl,
      };
    }
  }
}

// Export singleton instance
export const x402Service = new X402Service();