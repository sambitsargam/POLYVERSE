# x402 Protocol Implementation Guide

The x402 protocol enables HTTP-based micropayments for content subscriptions. POLYVERSE implements x402 with real USDC transactions on Polygon Amoy testnet.

## Overview

x402 is an HTTP status code (402 Payment Required) that enables web applications to request payment before serving content. Our implementation uses:

- **EIP-3009**: TransferWithAuthorization for gasless USDC transfers
- **Polygon Amoy**: Testnet for real blockchain transactions  
- **Official x402 Facilitator**: https://x402.polygon.technology

## Protocol Flow

### 1. Initial Content Request
```http
POST /api/subscriptions/purchase
Content-Type: application/json

{
  "planId": "basic-weekly"
}
```

### 2. 402 Payment Required Response
```http
HTTP/1.1 402 Payment Required
Content-Type: application/json

{
  "x402Version": 1,
  "error": "X-PAYMENT header is required",
  "accepts": [{
    "scheme": "exact",
    "network": "polygon-amoy",
    "maxAmountRequired": "5000000",
    "asset": "0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582",
    "payTo": "0x90D9CD66FAdFF1C2Ba32C99A47C76532d08A704B",
    "resource": "/api/subscriptions/activate/basic-weekly",
    "description": "Basic Weekly Subscription",
    "mimeType": "application/json",
    "maxTimeoutSeconds": 300
  }]
}
```

### 3. Payment Authorization
Client creates X-PAYMENT header with EIP-3009 signature:

```typescript
// Generate EIP-3009 TransferWithAuthorization signature
const domain = {
  name: 'USD Coin',
  version: '2', 
  chainId: 80002, // Polygon Amoy
  verifyingContract: '0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582'
};

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
  from: userAddress,
  to: recipientAddress,
  value: parseUnits('5.0', 6), // 5 USDC
  validAfter: Math.floor(Date.now() / 1000) - 60,
  validBefore: Math.floor(Date.now() / 1000) + 3600,
  nonce: cryptoRandomNonce
};

const signature = await walletClient.signTypedData({
  domain,
  types, 
  primaryType: 'TransferWithAuthorization',
  message
});
```

### 4. Payment Request with Authorization
```http
POST /api/subscriptions/purchase
Content-Type: application/json
X-PAYMENT: eyJzY2hlbWUiOiJleGFjdCIsIm5ldHdvcms...

{
  "planId": "basic-weekly"
}
```

### 5. Successful Payment Response
```http
HTTP/1.1 200 OK
Content-Type: application/json
X-PAYMENT-RESPONSE: eyJ0cmFuc2FjdGlvbiI6IjB4YWJjMTIz...

{
  "success": true,
  "txHash": "0xabc123def456...", 
  "subscriptionId": "sub_xyz789",
  "expiresAt": "2025-10-04T12:00:00Z"
}
```

## Implementation Details

### Server-Side (API Route)

```typescript
// src/app/api/subscriptions/purchase/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const paymentHeader = request.headers.get('X-PAYMENT');
  
  if (!paymentHeader) {
    // Return 402 with payment requirements
    return NextResponse.json({
      x402Version: 1,
      error: "X-PAYMENT header is required",
      accepts: [createPaymentRequirements(planId)]
    }, { status: 402 });
  }
  
  // Verify payment with x402 facilitator
  const verification = await verifyPaymentWithFacilitator(paymentHeader);
  
  if (verification.success) {
    // Settle transaction on blockchain
    const txHash = await settleTransaction(verification.data);
    
    return NextResponse.json({
      success: true,
      txHash,
      subscriptionId: generateSubscriptionId()
    });
  }
  
  return NextResponse.json({
    error: "Payment verification failed"
  }, { status: 402 });
}
```

### Client-Side (Payment Service)

```typescript
// src/lib/x402-subscription-service.ts
export class X402SubscriptionService {
  async purchaseSubscription(plan: SubscriptionPlan, walletClient: any) {
    // Step 1: Initial request
    const response = await fetch('/api/subscriptions/purchase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planId: plan.id })
    });
    
    if (response.status === 402) {
      const paymentData = await response.json();
      
      // Step 2: Create payment authorization
      const paymentHeader = await this.createPaymentHeader(
        plan, 
        userAddress, 
        walletClient
      );
      
      // Step 3: Send payment
      const paymentResponse = await fetch('/api/subscriptions/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-PAYMENT': paymentHeader
        },
        body: JSON.stringify({ planId: plan.id })
      });
      
      return await paymentResponse.json();
    }
  }
}
```

## Network Configuration

### Polygon Amoy Testnet
```typescript
const polygonAmoy = {
  id: 80002,
  name: 'Polygon Amoy',
  network: 'polygon-amoy', 
  nativeCurrency: { name: 'POL', symbol: 'POL', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc-amoy.polygon.technology'] }
  },
  blockExplorers: {
    default: { name: 'PolygonScan', url: 'https://amoy.polygonscan.com' }
  },
  testnet: true
};
```

### USDC Token Contract
- **Address**: `0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582`
- **Decimals**: 6
- **Symbol**: USDC
- **Network**: Polygon Amoy

## Testing

### Manual Testing
```bash
#!/bin/bash
# test-x402-flow.sh

echo "Testing x402 Protocol Flow..."

# Step 1: Initial request (expect 402)
echo "1. Initial request without payment..."
curl -X POST http://localhost:3000/api/subscriptions/purchase \
  -H "Content-Type: application/json" \
  -d '{"planId":"basic-weekly"}' \
  -w "\nStatus: %{http_code}\n"

# Step 2: Request with payment header (expect 200)  
echo -e "\n2. Request with payment authorization..."
PAYMENT_HEADER=$(echo '{"scheme":"exact","signature":"0x123..."}' | base64)
curl -X POST http://localhost:3000/api/subscriptions/purchase \
  -H "Content-Type: application/json" \
  -H "X-PAYMENT: $PAYMENT_HEADER" \
  -d '{"planId":"basic-weekly"}' \
  -w "\nStatus: %{http_code}\n"
```

### Unit Tests
```typescript
// __tests__/x402-protocol.test.ts
describe('x402 Protocol', () => {
  test('returns 402 without payment header', async () => {
    const response = await request(app)
      .post('/api/subscriptions/purchase')
      .send({ planId: 'basic-weekly' });
      
    expect(response.status).toBe(402);
    expect(response.body.x402Version).toBe(1);
    expect(response.body.accepts).toBeDefined();
  });
  
  test('processes valid payment header', async () => {
    const paymentHeader = await createValidPaymentHeader();
    
    const response = await request(app)
      .post('/api/subscriptions/purchase')
      .set('X-PAYMENT', paymentHeader)
      .send({ planId: 'basic-weekly' });
      
    expect(response.status).toBe(200);
    expect(response.body.txHash).toMatch(/^0x[a-fA-F0-9]{64}$/);
  });
});
```

## Troubleshooting

### Common Issues

**Problem**: "Wallet not connected"
```typescript
// Solution: Initialize wallet client properly
const { data: walletClient } = useWalletClient();
await service.initializeClientWallet(walletClient);
```

**Problem**: "Insufficient funds for USDC transfer"
```bash
# Solution: Get test USDC on Polygon Amoy
# 1. Get POL from faucet: https://faucet.polygon.technology/
# 2. Use USDC faucet or request from contract
```

**Problem**: "Chain not supported"
```typescript
// Solution: Switch to Polygon Amoy
await walletClient.switchChain({ id: 80002 });
```

**Problem**: "Transaction reverted"
```typescript
// Common causes:
// - Insufficient USDC balance
// - Invalid signature format  
// - Expired nonce or timestamp
// - Wrong contract address
```

### Debug Mode
```bash
# Enable debug logging
DEBUG=x402:* npm run dev

# Console will show:
# x402:client Creating payment header...
# x402:server Verifying with facilitator...
# x402:blockchain Settling transaction...
```

## Security Considerations

### Payment Security
- **Signature Validation**: All EIP-3009 signatures verified on-chain
- **Nonce Protection**: Prevents replay attacks with unique nonces
- **Time Bounds**: Signatures expire after 1 hour
- **Amount Limits**: Maximum payment amounts enforced

### Network Security
- **Testnet Only**: Current implementation uses Polygon Amoy testnet
- **HTTPS Required**: All API communication over encrypted connections
- **Rate Limiting**: Prevent abuse with request throttling
- **Input Validation**: Sanitize all user inputs and payment data

### Best Practices
- Never expose private keys in client-side code
- Use environment variables for sensitive configuration
- Implement proper error handling and user feedback
- Monitor transaction success/failure rates
- Set up alerting for failed payments or unusual activity