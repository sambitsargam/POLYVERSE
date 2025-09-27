# KiraPay Integration Guide

KiraPay provides multi-chain cryptocurrency payment processing for POLYVERSE, enabling creators to accept payments in various tokens across different blockchain networks.

## Overview

KiraPay is a Web3 payment gateway that supports:
- **Multi-Chain**: Ethereum, Polygon, BSC, Avalanche, Filecoin
- **Multi-Token**: USDC, ETH, MATIC, AVAX, FIL, and custom tokens
- **Fiat On-Ramp**: Credit card to crypto conversion
- **Creator Tools**: Revenue analytics and settlement

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   POLYVERSE     │───▶│    KiraPay       │───▶│   Blockchain    │
│   Checkout      │    │    Gateway       │    │   Networks      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   User Wallet   │    │   Payment        │    │   Creator       │
│   Connection    │    │   Processing     │    │   Settlement    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Implementation

### 1. KiraPay Service Setup

```typescript
// src/lib/kirapay-integration.ts
import { KiraPaySDK } from '@kirapay/sdk';

interface KiraPayConfig {
  apiKey: string;
  secretKey: string;
  environment: 'sandbox' | 'production';
  webhookUrl: string;
}

class KiraPayService {
  private sdk: KiraPaySDK;
  private config: KiraPayConfig;

  constructor() {
    this.config = {
      apiKey: process.env.KIRAPAY_API_KEY!,
      secretKey: process.env.KIRAPAY_SECRET!,
      environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
      webhookUrl: process.env.KIRAPAY_WEBHOOK_URL!
    };

    this.sdk = new KiraPaySDK({
      apiKey: this.config.apiKey,
      environment: this.config.environment
    });
  }

  // Create payment session
  async createPayment(request: PaymentRequest): Promise<PaymentSession> {
    try {
      const paymentSession = await this.sdk.payments.create({
        amount: request.amount,
        currency: request.currency,
        network: request.network,
        recipient: request.creatorWallet,
        metadata: {
          subscriptionId: request.subscriptionId,
          planId: request.planId,
          platform: 'polyverse',
          creatorId: request.creatorId
        },
        successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
        cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payment/cancel`,
        webhookUrl: this.config.webhookUrl
      });

      return {
        id: paymentSession.id,
        url: paymentSession.url,
        expiresAt: paymentSession.expiresAt,
        status: 'pending'
      };
    } catch (error) {
      throw new Error(`Payment creation failed: ${error.message}`);
    }
  }

  // Get payment status
  async getPaymentStatus(paymentId: string): Promise<PaymentStatus> {
    try {
      const payment = await this.sdk.payments.retrieve(paymentId);
      
      return {
        id: payment.id,
        status: payment.status,
        txHash: payment.txHash,
        network: payment.network,
        amount: payment.amount,
        currency: payment.currency,
        createdAt: payment.createdAt,
        confirmedAt: payment.confirmedAt
      };
    } catch (error) {
      throw new Error(`Payment status check failed: ${error.message}`);
    }
  }

  // Process webhook
  async processWebhook(payload: any, signature: string): Promise<WebhookResult> {
    try {
      // Verify webhook signature
      const isValid = await this.verifyWebhookSignature(payload, signature);
      if (!isValid) {
        throw new Error('Invalid webhook signature');
      }

      const event = payload.event;
      const paymentData = payload.data;

      switch (event) {
        case 'payment.completed':
          await this.handlePaymentCompleted(paymentData);
          break;
        case 'payment.failed':
          await this.handlePaymentFailed(paymentData);
          break;
        case 'payment.refunded':
          await this.handlePaymentRefunded(paymentData);
          break;
        default:
          console.log(`Unhandled webhook event: ${event}`);
      }

      return { success: true };
    } catch (error) {
      console.error('Webhook processing failed:', error);
      return { success: false, error: error.message };
    }
  }

  private async verifyWebhookSignature(
    payload: any, 
    signature: string
  ): Promise<boolean> {
    const crypto = await import('crypto');
    const expected = crypto
      .createHmac('sha256', this.config.secretKey)
      .update(JSON.stringify(payload))
      .digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expected)
    );
  }

  private async handlePaymentCompleted(paymentData: any) {
    // Activate subscription
    console.log('Payment completed:', paymentData);
    
    // Update database
    await this.updateSubscriptionStatus(
      paymentData.metadata.subscriptionId,
      'active',
      paymentData.txHash
    );
    
    // Send confirmation email
    await this.sendPaymentConfirmation(paymentData);
  }

  private async handlePaymentFailed(paymentData: any) {
    console.log('Payment failed:', paymentData);
    
    // Update subscription status
    await this.updateSubscriptionStatus(
      paymentData.metadata.subscriptionId,
      'failed'
    );
    
    // Notify user
    await this.sendPaymentFailedNotification(paymentData);
  }

  private async handlePaymentRefunded(paymentData: any) {
    console.log('Payment refunded:', paymentData);
    
    // Deactivate subscription
    await this.updateSubscriptionStatus(
      paymentData.metadata.subscriptionId,
      'refunded'
    );
  }
}

export const kiraPayService = new KiraPayService();
```

### 2. Payment API Routes

```typescript
// src/app/api/payments/create/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { kiraPayService } from '@/lib/kirapay-integration';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      amount,
      currency,
      network,
      creatorWallet,
      subscriptionPlan,
      creatorId
    } = body;

    // Validate required fields
    if (!amount || !currency || !network || !creatorWallet) {
      return NextResponse.json(
        { error: 'Missing required payment parameters' },
        { status: 400 }
      );
    }

    // Create payment session
    const paymentSession = await kiraPayService.createPayment({
      amount,
      currency,
      network,
      creatorWallet,
      subscriptionId: generateSubscriptionId(),
      planId: subscriptionPlan,
      creatorId
    });

    return NextResponse.json({
      success: true,
      paymentId: paymentSession.id,
      paymentUrl: paymentSession.url,
      expiresAt: paymentSession.expiresAt
    });

  } catch (error) {
    console.error('Payment creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    );
  }
}
```

```typescript
// src/app/api/payments/status/route.ts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get('id');

    if (!paymentId) {
      return NextResponse.json(
        { error: 'Payment ID required' },
        { status: 400 }
      );
    }

    const status = await kiraPayService.getPaymentStatus(paymentId);
    return NextResponse.json(status);

  } catch (error) {
    console.error('Payment status error:', error);
    return NextResponse.json(
      { error: 'Failed to get payment status' },
      { status: 500 }
    );
  }
}
```

```typescript
// src/app/api/webhooks/kirapay/route.ts
export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const signature = request.headers.get('X-KiraPay-Signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      );
    }

    const result = await kiraPayService.processWebhook(payload, signature);
    
    if (result.success) {
      return NextResponse.json({ received: true });
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
```

## Frontend Integration

### 1. Payment Component

```tsx
// src/components/payments/KiraPayCheckout.tsx
'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';

interface KiraPayCheckoutProps {
  subscriptionPlan: {
    id: string;
    name: string;
    price: number;
    currency: string;
  };
  creatorWallet: string;
  creatorId: string;
  onSuccess: (paymentId: string) => void;
  onError: (error: string) => void;
}

export function KiraPayCheckout({
  subscriptionPlan,
  creatorWallet,
  creatorId,
  onSuccess,
  onError
}: KiraPayCheckoutProps) {
  const [loading, setLoading] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState('polygon');
  const { address } = useAccount();

  const supportedNetworks = [
    { id: 'polygon', name: 'Polygon', currency: 'USDC' },
    { id: 'ethereum', name: 'Ethereum', currency: 'ETH' },
    { id: 'filecoin', name: 'Filecoin', currency: 'FIL' }
  ];

  const handlePayment = async () => {
    if (!address) {
      onError('Please connect your wallet first');
      return;
    }

    setLoading(true);

    try {
      // Create payment session
      const response = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: subscriptionPlan.price.toString(),
          currency: supportedNetworks.find(n => n.id === selectedNetwork)?.currency || 'USDC',
          network: selectedNetwork,
          creatorWallet,
          subscriptionPlan: subscriptionPlan.id,
          creatorId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create payment');
      }

      const { paymentUrl, paymentId } = await response.json();

      // Redirect to KiraPay checkout
      window.location.href = paymentUrl;

      // Or use embedded iframe
      // setPaymentUrl(paymentUrl);
      // setShowPaymentModal(true);

    } catch (error) {
      console.error('Payment initiation failed:', error);
      onError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="kirapay-checkout">
      <div className="plan-details">
        <h3>{subscriptionPlan.name}</h3>
        <p className="price">${subscriptionPlan.price}</p>
      </div>

      <div className="network-selection">
        <label>Payment Network:</label>
        <select
          value={selectedNetwork}
          onChange={(e) => setSelectedNetwork(e.target.value)}
          className="network-select"
        >
          {supportedNetworks.map(network => (
            <option key={network.id} value={network.id}>
              {network.name} ({network.currency})
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={handlePayment}
        disabled={loading || !address}
        className="pay-button"
      >
        {loading ? 'Processing...' : `Pay with ${selectedNetwork}`}
      </button>

      {!address && (
        <p className="wallet-warning">
          Please connect your wallet to continue
        </p>
      )}
    </div>
  );
}
```

### 2. Payment Status Component

```tsx
// src/components/payments/PaymentStatus.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export function PaymentStatus() {
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [paymentDetails, setPaymentDetails] = useState(null);
  const searchParams = useSearchParams();
  const paymentId = searchParams.get('payment_id');

  useEffect(() => {
    if (paymentId) {
      checkPaymentStatus();
    }
  }, [paymentId]);

  const checkPaymentStatus = async () => {
    try {
      const response = await fetch(`/api/payments/status?id=${paymentId}`);
      const data = await response.json();

      setPaymentDetails(data);

      if (data.status === 'completed') {
        setStatus('success');
      } else if (data.status === 'failed') {
        setStatus('failed');
      } else {
        // Still processing, check again in 2 seconds
        setTimeout(checkPaymentStatus, 2000);
      }

    } catch (error) {
      console.error('Status check failed:', error);
      setStatus('failed');
    }
  };

  if (status === 'loading') {
    return (
      <div className="payment-status loading">
        <div className="spinner" />
        <h2>Processing Payment...</h2>
        <p>Please wait while we confirm your transaction on the blockchain.</p>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="payment-status success">
        <div className="success-icon">✅</div>
        <h2>Payment Successful!</h2>
        <p>Your subscription has been activated.</p>
        
        {paymentDetails && (
          <div className="payment-details">
            <p><strong>Transaction Hash:</strong> {paymentDetails.txHash}</p>
            <p><strong>Network:</strong> {paymentDetails.network}</p>
            <p><strong>Amount:</strong> {paymentDetails.amount} {paymentDetails.currency}</p>
          </div>
        )}
        
        <button 
          onClick={() => window.location.href = '/dashboard'}
          className="continue-button"
        >
          Continue to Dashboard
        </button>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="payment-status failed">
        <div className="error-icon">❌</div>
        <h2>Payment Failed</h2>
        <p>There was an issue processing your payment. Please try again.</p>
        
        <button 
          onClick={() => window.history.back()}
          className="retry-button"
        >
          Try Again
        </button>
      </div>
    );
  }
}
```

## Configuration

### Environment Variables

```bash
# .env.local
KIRAPAY_API_KEY=pk_live_or_test_your_api_key_here
KIRAPAY_SECRET=sk_live_or_test_your_secret_key_here
KIRAPAY_WEBHOOK_URL=https://yourapp.com/api/webhooks/kirapay
NEXT_PUBLIC_KIRAPAY_PUBLIC_KEY=pk_live_or_test_public_key
```

## Testing

### Unit Tests

```typescript
// __tests__/kirapay-integration.test.ts
import { kiraPayService } from '@/lib/kirapay-integration';

describe('KiraPay Integration', () => {
  test('creates payment session', async () => {
    const paymentRequest = {
      amount: '5.00',
      currency: 'USDC',
      network: 'polygon',
      creatorWallet: '0x123...',
      subscriptionId: 'sub_test',
      planId: 'basic-weekly',
      creatorId: 'creator_test'
    };

    const session = await kiraPayService.createPayment(paymentRequest);
    
    expect(session.id).toBeDefined();
    expect(session.url).toMatch(/^https:\/\//);
    expect(session.status).toBe('pending');
  });

  test('processes webhook correctly', async () => {
    const webhook = {
      event: 'payment.completed',
      data: {
        id: 'pay_test123',
        status: 'completed',
        txHash: '0xabc123...',
        metadata: {
          subscriptionId: 'sub_test'
        }
      }
    };

    const signature = 'valid_signature';
    const result = await kiraPayService.processWebhook(webhook, signature);
    
    expect(result.success).toBe(true);
  });
});
```

### Manual Testing

```bash
#!/bin/bash
# test-kirapay-integration.sh

echo "Testing KiraPay Integration..."

# Test payment creation
echo "1. Creating payment session..."
curl -X POST http://localhost:3000/api/payments/create \
  -H "Content-Type: application/json" \
  -d '{
    "amount": "5.00",
    "currency": "USDC",
    "network": "polygon", 
    "creatorWallet": "0x123...",
    "subscriptionPlan": "basic-weekly",
    "creatorId": "creator_test"
  }'

echo -e "\n---\n"

# Test webhook endpoint
echo "2. Testing webhook..."
curl -X POST http://localhost:3000/api/webhooks/kirapay \
  -H "Content-Type: application/json" \
  -H "X-KiraPay-Signature: test_signature" \
  -d '{
    "event": "payment.completed",
    "data": {
      "id": "pay_test",
      "status": "completed",
      "txHash": "0xtest...",
      "metadata": {"subscriptionId": "sub_test"}
    }
  }'
```

## Troubleshooting

### Common Issues

**Problem**: "Invalid API key"
```bash
# Solution: Check KiraPay dashboard for correct keys
# Sandbox: pk_test_... / sk_test_...
# Production: pk_live_... / sk_live_...
```

**Problem**: "Webhook signature verification failed"
```typescript
// Solution: Ensure correct secret key and payload format
const expectedSignature = crypto
  .createHmac('sha256', process.env.KIRAPAY_SECRET)
  .update(JSON.stringify(payload))
  .digest('hex');
```

**Problem**: "Network not supported" 
```typescript
// Solution: Check supported networks
const supportedNetworks = await kiraPayService.getSupportedNetworks();
console.log('Available networks:', supportedNetworks);
```

**Problem**: "Payment stuck in pending status"
```typescript
// Debug payment status
const status = await kiraPayService.getPaymentStatus(paymentId);
console.log('Payment details:', status);

// Check blockchain confirmation
if (status.txHash) {
  // Verify transaction on block explorer
  console.log(`Check TX: https://polygonscan.com/tx/${status.txHash}`);
}
```

### Debug Mode

```bash
# Enable KiraPay debug logging
DEBUG=kirapay:* npm run dev

# Console output:
# kirapay:api Creating payment session...
# kirapay:webhook Processing payment.completed event...
# kirapay:settlement Updating subscription status...
```

## Best Practices

### Security
- Always verify webhook signatures
- Use HTTPS for all endpoints
- Store API keys in environment variables
- Implement rate limiting on payment endpoints
- Log all payment events for audit trails

### User Experience
- Provide clear payment status updates
- Show supported networks and tokens
- Handle network switching gracefully
- Implement payment retry mechanisms
- Send confirmation emails

### Error Handling
- Graceful fallbacks for network issues
- Clear error messages for users
- Automatic retry for failed webhooks
- Monitor payment success/failure rates
- Alert on unusual payment patterns

### Performance
- Cache supported networks/tokens
- Implement payment status polling
- Use database for payment records
- Monitor API response times
- Set up proper indexing for queries