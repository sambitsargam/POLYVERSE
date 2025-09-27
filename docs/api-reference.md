# API Reference

Complete API documentation for POLYVERSE endpoints covering x402 subscriptions, Filecoin storage, and KiraPay payments.

## Base URL

```
Local Development: http://localhost:3000
```

## Authentication

Some endpoints require authentication:

```http
Authorization: Bearer YOUR_API_KEY
```

## x402 Subscription API

### Purchase Subscription

Handles x402 protocol subscription purchases with real blockchain transactions.

#### `POST /api/subscriptions/purchase`

**Request without X-PAYMENT header (Initial):**
```http
POST /api/subscriptions/purchase
Content-Type: application/json

{
  "planId": "basic-weekly"
}
```

**Response: HTTP 402 Payment Required**
```json
{
  "x402Version": 1,
  "error": "X-PAYMENT header is required for subscription purchase",
  "accepts": [{
    "scheme": "exact",
    "network": "polygon-amoy",
    "maxAmountRequired": "5000000",
    "asset": "0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582",
    "payTo": "0x90D9CD66FAdFF1C2Ba32C99A47C76532d08A704B",
    "resource": "/api/subscriptions/activate/basic-weekly",
    "description": "Subscription: Basic Weekly - Perfect for trying out premium content",
    "mimeType": "application/json",
    "maxTimeoutSeconds": 300,
    "extra": {
      "name": "USDC",
      "version": "2", 
      "subscriptionPlan": "basic-weekly",
      "duration": 604800
    }
  }]
}
```

**Request with X-PAYMENT header (Payment Authorization):**
```http
POST /api/subscriptions/purchase
Content-Type: application/json
X-PAYMENT: eyJzY2hlbWUiOiJleGFjdCIsIm5ldHdvcms...

{
  "planId": "basic-weekly",
  "paymentRequirements": {
    "scheme": "exact",
    "network": "polygon-amoy",
    "maxAmountRequired": "5000000",
    "asset": "0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582",
    "payTo": "0x90D9CD66FAdFF1C2Ba32C99A47C76532d08A704B"
  }
}
```

**Response: HTTP 200 OK**
```json
{
  "success": true,
  "txHash": "0xabc123def456789...",
  "subscriptionId": "sub_1727436120_basic_weekly",
  "planId": "basic-weekly",
  "expiresAt": "2025-10-04T12:02:00.000Z",
  "network": "polygon-amoy",
  "amount": "5000000"
}
```

### Get Subscription Plans

#### `GET /api/subscriptions/plans`

**Response:**
```json
{
  "plans": [
    {
      "id": "basic-weekly",
      "name": "Basic Weekly",
      "description": "Perfect for trying out premium content",
      "price": 5.00,
      "duration": 604800,
      "features": [
        "Access to premium content",
        "Weekly content updates",
        "Community access",
        "Basic support"
      ],
      "network": "polygon-amoy",
      "usdcAmount": "5000000"
    },
    {
      "id": "pro-monthly", 
      "name": "Pro Monthly",
      "description": "For regular consumers of quality content",
      "price": 15.00,
      "duration": 2592000,
      "features": [
        "All Basic features",
        "Exclusive pro content",
        "Early access to new releases",
        "Priority support",
        "Download privileges"
      ],
      "network": "polygon-amoy",
      "usdcAmount": "15000000",
      "isPopular": true
    }
  ]
}
```

### Check Subscription Status

#### `GET /api/subscriptions/status?planId={planId}&userAddress={address}`

**Response:**
```json
{
  "planId": "basic-weekly",
  "status": "active",
  "startTime": 1727436120,
  "endTime": 1728040920,
  "txHash": "0xabc123def456...",
  "network": "polygon-amoy",
  "daysRemaining": 7
}
```

## Filecoin Storage API

### Upload File

Upload files to Filecoin network via Lighthouse SDK.

#### `POST /api/storage/upload`

**Request (Multipart Form Data):**
```http
POST /api/storage/upload
Authorization: Bearer YOUR_LIGHTHOUSE_API_KEY
Content-Type: multipart/form-data

file: [FILE_BINARY_DATA]
encrypt: true
publicKey: 0x742d35Cc6C6C4e6C3C4c4c4c4c4c4c4c4c4c4c4c
signedMessage: 0x1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c
```

**Response:**
```json
{
  "success": true,
  "hash": "QmYjtig7VJQ6XsnUjqqJvj7QaMcCAwtrgNdahSiFofrE7o",
  "url": "https://gateway.lighthouse.storage/ipfs/QmYjtig7VJQ6XsnUjqqJvj7QaMcCAwtrgNdahSiFofrE7o",
  "size": "1024000",
  "name": "premium-content.pdf",
  "encrypted": true,
  "dealId": "123456"
}
```

### Get File Deal Status

Check Filecoin storage deal information for uploaded files.

#### `GET /api/storage/deals?hash={ipfsHash}`

**Response:**
```json
{
  "hash": "QmYjtig7VJQ6XsnUjqqJvj7QaMcCAwtrgNdahSiFofrE7o",
  "deals": [
    {
      "dealId": "123456",
      "miner": "f01234",
      "status": "active",
      "startEpoch": 2851234,
      "endEpoch": 3851234,
      "storagePrice": "0.0000001",
      "verified": true
    }
  ],
  "totalSize": "1024000",
  "lastUpdate": "2025-09-27T12:02:00.000Z"
}
```

### Check Access Permissions

Verify if user has access to encrypted content.

#### `POST /api/storage/check-access`

**Request:**
```json
{
  "hash": "QmYjtig7VJQ6XsnUjqqJvj7QaMcCAwtrgNdahSiFofrE7o",
  "userAddress": "0x742d35Cc6C6C4e6C3C4c4c4c4c4c4c4c4c4c4c4c",
  "conditions": [
    {
      "id": 1,
      "chain": "polygon",
      "method": "hasActiveSubscription",
      "contractAddress": "0x...",
      "parameters": [":userAddress", "basic-weekly"]
    }
  ]
}
```

**Response:**
```json
{
  "hasAccess": true,
  "decryptedUrl": "https://gateway.lighthouse.storage/ipfs/QmYjtig7VJQ6XsnUjqqJvj7QaMcCAwtrgNdahSiFofrE7o",
  "expiresAt": "2025-10-04T12:02:00.000Z",
  "accessReason": "Active subscription: basic-weekly"
}
```

## KiraPay Payment API

### Create Payment

Create multi-chain cryptocurrency payment session.

#### `POST /api/payments/create`

**Request:**
```json
{
  "amount": "5.00",
  "currency": "USDC",
  "network": "polygon",
  "creatorWallet": "0x90D9CD66FAdFF1C2Ba32C99A47C76532d08A704B",
  "subscriptionPlan": "basic-weekly",
  "creatorId": "creator_123"
}
```

**Response:**
```json
{
  "success": true,
  "paymentId": "pay_1727436120_abc123",
  "paymentUrl": "https://pay.kirapay.com/checkout/pay_1727436120_abc123",
  "expiresAt": "2025-09-27T13:02:00.000Z",
  "qrCode": "https://api.qrserver.com/v1/create-qr-code/?data=..."
}
```

### Get Payment Status

Check status of KiraPay payment transaction.

#### `GET /api/payments/status?id={paymentId}`

**Response:**
```json
{
  "id": "pay_1727436120_abc123",
  "status": "completed",
  "txHash": "0xdef456789abc123...",
  "network": "polygon",
  "amount": "5.00",
  "currency": "USDC",
  "createdAt": "2025-09-27T12:02:00.000Z",
  "confirmedAt": "2025-09-27T12:05:30.000Z",
  "confirmations": 12
}
```

### Webhook Endpoint

Receive payment status updates from KiraPay.

#### `POST /api/webhooks/kirapay`

**Headers:**
```http
X-KiraPay-Signature: sha256=abc123def456...
Content-Type: application/json
```

**Request:**
```json
{
  "event": "payment.completed",
  "data": {
    "id": "pay_1727436120_abc123",
    "status": "completed",
    "txHash": "0xdef456789abc123...",
    "network": "polygon",
    "amount": "5.00",
    "currency": "USDC",
    "metadata": {
      "subscriptionId": "sub_basic_weekly_123",
      "planId": "basic-weekly",
      "platform": "polyverse",
      "creatorId": "creator_123"
    }
  }
}
```

**Response:**
```json
{
  "received": true
}
```

## Wallet Configuration API

### Get Supported Networks

#### `GET /api/wallet/networks`

**Response:**
```json
{
  "networks": [
    {
      "id": "polygon-amoy",
      "name": "Polygon Amoy",
      "chainId": 80002,
      "rpcUrl": "https://rpc-amoy.polygon.technology",
      "blockExplorer": "https://amoy.polygonscan.com",
      "nativeCurrency": {
        "name": "POL",
        "symbol": "POL",
        "decimals": 18
      },
      "testnet": true,
      "supported": true,
      "primary": true
    },
    {
      "id": "polygon",
      "name": "Polygon",
      "chainId": 137,
      "rpcUrl": "https://polygon-rpc.com", 
      "blockExplorer": "https://polygonscan.com",
      "nativeCurrency": {
        "name": "MATIC",
        "symbol": "MATIC", 
        "decimals": 18
      },
      "testnet": false,
      "supported": true
    }
  ]
}
```

### Get Token Information

#### `GET /api/wallet/tokens?network={networkId}`

**Response:**
```json
{
  "network": "polygon-amoy",
  "tokens": [
    {
      "symbol": "USDC",
      "name": "USD Coin",
      "address": "0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582",
      "decimals": 6,
      "logoUrl": "https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png",
      "verified": true,
      "primary": true
    },
    {
      "symbol": "POL",
      "name": "Polygon",
      "address": "native",
      "decimals": 18,
      "logoUrl": "https://assets.coingecko.com/coins/images/4713/large/polygon.png",
      "verified": true
    }
  ]
}
```

## Analytics API

### Get Creator Analytics

#### `GET /api/analytics/creator?creatorId={id}&period={timeframe}`

**Query Parameters:**
- `creatorId`: Creator identifier
- `period`: `7d`, `30d`, `90d`, `1y`

**Response:**
```json
{
  "creatorId": "creator_123",
  "period": "30d",
  "stats": {
    "totalRevenue": "150.50",
    "totalSubscribers": 47,
    "activeSubscriptions": 42,
    "newSubscriptions": 15,
    "churnRate": 0.12,
    "averageRevenuePerUser": "3.20"
  },
  "revenueChart": [
    { "date": "2025-09-01", "amount": "25.00", "subscribers": 5 },
    { "date": "2025-09-02", "amount": "30.00", "subscribers": 6 },
    { "date": "2025-09-03", "amount": "15.00", "subscribers": 3 }
  ],
  "topPlans": [
    { "planId": "basic-weekly", "subscribers": 25, "revenue": "125.00" },
    { "planId": "pro-monthly", "subscribers": 17, "revenue": "255.00" }
  ]
}
```

### Get Platform Analytics

#### `GET /api/analytics/platform?period={timeframe}`

**Response:**
```json
{
  "period": "30d",
  "platformStats": {
    "totalRevenue": "12450.75",
    "totalCreators": 234,
    "totalSubscribers": 1847,
    "totalTransactions": 3924,
    "averageSubscriptionValue": "8.50"
  },
  "networkDistribution": {
    "polygon-amoy": { "transactions": 3500, "volume": "10200.25" },
    "polygon": { "transactions": 424, "volume": "2250.50" }
  },
  "paymentMethods": {
    "x402-protocol": { "count": 3500, "volume": "10200.25" },
    "kirapay": { "count": 424, "volume": "2250.50" }
  }
}
```

## Error Responses

### Common Error Codes

**400 Bad Request**
```json
{
  "error": "Bad Request",
  "message": "Missing required parameter: planId",
  "code": "MISSING_PARAMETER"
}
```

**401 Unauthorized**
```json
{
  "error": "Unauthorized", 
  "message": "Invalid API key",
  "code": "INVALID_API_KEY"
}
```

**402 Payment Required**
```json
{
  "x402Version": 1,
  "error": "X-PAYMENT header is required",
  "accepts": [{ /* payment requirements */ }]
}
```

**404 Not Found**
```json
{
  "error": "Not Found",
  "message": "Subscription plan not found", 
  "code": "PLAN_NOT_FOUND"
}
```

**429 Too Many Requests**
```json
{
  "error": "Too Many Requests",
  "message": "Rate limit exceeded",
  "retryAfter": 60
}
```

**500 Internal Server Error**
```json
{
  "error": "Internal Server Error",
  "message": "Blockchain transaction failed",
  "code": "TRANSACTION_FAILED"
}
```

## Rate Limiting

API endpoints are rate limited to prevent abuse:

- **Authentication required endpoints**: 100 requests per minute
- **Public endpoints**: 60 requests per minute
- **Payment endpoints**: 10 requests per minute
- **Webhook endpoints**: No limit (authenticated via signature)

Rate limit headers are included in responses:
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1727439720
```

## Webhooks

### Webhook Events

| Event | Description |
|-------|-------------|
| `subscription.created` | New subscription created |
| `subscription.activated` | Payment confirmed, subscription active |
| `subscription.expired` | Subscription period ended |
| `subscription.cancelled` | User cancelled subscription |
| `payment.completed` | Payment transaction confirmed |
| `payment.failed` | Payment transaction failed |
| `storage.uploaded` | File uploaded to Filecoin |
| `storage.deal_confirmed` | Filecoin storage deal confirmed |

### Webhook Security

Webhooks include signature verification:

```http
X-Webhook-Signature: sha256=abc123def456...
```

Verify using HMAC-SHA256 with your webhook secret:

```typescript
const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(`sha256=${expected}`)
  );
}
```

## SDKs and Libraries

### JavaScript/TypeScript SDK

```bash
npm install @polyverse/sdk
```

```typescript
import { PolyverseSDK } from '@polyverse/sdk';

const sdk = new PolyverseSDK({
  apiKey: 'your-api-key',
  environment: 'production' // or 'sandbox'
});

// Purchase subscription
const subscription = await sdk.subscriptions.purchase({
  planId: 'basic-weekly',
  walletClient: walletClient
});

// Upload to Filecoin
const upload = await sdk.storage.upload(file, {
  encrypt: true,
  accessConditions: [/* NFT or subscription conditions */]
});
```

### cURL Examples

```bash
# Purchase subscription (initial 402 response)
curl -X POST https://api.polyverse.com/subscriptions/purchase \
  -H "Content-Type: application/json" \
  -d '{"planId":"basic-weekly"}'

# Upload file to Filecoin
curl -X POST https://api.polyverse.com/storage/upload \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -F "file=@content.pdf" \
  -F "encrypt=true"

# Create KiraPay payment
curl -X POST https://api.polyverse.com/payments/create \
  -H "Content-Type: application/json" \
  -d '{
    "amount":"5.00",
    "currency":"USDC", 
    "network":"polygon",
    "creatorWallet":"0x..."
  }'
```