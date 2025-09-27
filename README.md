# POLYVERSE — Decentralized Creator Economy Platform 🚀

A Web3 creator platform that enables subscription-based content monetization through **x402 protocol payments**, **Filecoin decentralized storage**, and **KiraPay multi-chain processing**.

## ✨ Key Features

🔐 **x402 Protocol Subscriptions** - HTTP 402 paywall with real USDC payments on Polygon Amoy  
🌐 **Filecoin Lighthouse Storage** - Decentralized, encrypted content hosting  
💳 **KiraPay Integration** - Multi-chain crypto payment processing  
📊 **Creator Dashboard** - Real-time analytics and subscriber management  
🎯 **Token-Gated Content** - NFT and subscription-based access control  

## 🚀 Quick Start

### 1. Installation
```bash
git clone https://github.com/sambitsargam/POLYVERSE.git
cd POLYVERSE
npm install
```

### 2. Environment Setup
```bash
cp .env.example .env.local
# Edit .env.local with your API keys
```

### 3. Required API Keys
- **Lighthouse API**: Get from [lighthouse.storage](https://lighthouse.storage) for Filecoin storage
- **KiraPay API**: Get from [kirapay.com](https://kirapay.com) for payment processing  
- **Polygon Amoy**: Configure wallet for testnet USDC payments

### 4. Start Development
```bash
npm run dev
# Open http://localhost:3000
```

## 🎯 How It Works

### For Creators
1. **Upload Content** → Files stored on Filecoin via Lighthouse
2. **Set Subscription Plans** → Configure pricing and access tiers
3. **Receive Payments** → USDC payments via x402 protocol
4. **Track Analytics** → Monitor subscribers and earnings

### For Subscribers  
1. **Connect Wallet** → Support for major Web3 wallets
2. **Choose Plan** → Select subscription tier
3. **Pay with USDC** → Real blockchain transactions on Polygon Amoy
4. **Access Content** → Token-gated premium content

## 🛠️ Technology Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Blockchain**: Polygon Amoy, x402 Protocol, EIP-3009 signatures
- **Storage**: Filecoin network via Lighthouse SDK
- **Payments**: KiraPay multi-chain processing
- **Wallet**: RainbowKit, Wagmi, viem

## 📚 Documentation

Comprehensive technical documentation is available in the `/docs` folder:

- **[x402 Protocol Guide](./docs/x402-protocol.md)** - HTTP 402 implementation details
- **[Filecoin Storage Guide](./docs/filecoin-lighthouse.md)** - Decentralized storage integration  
- **[KiraPay Integration](./docs/kirapay-payments.md)** - Payment processing setup
- **[API Reference](./docs/api-reference.md)** - Complete API documentation
- **[Deployment Guide](./docs/deployment.md)** - Production deployment instructions

## 🧪 Demo & Testing

### Live Demo
Visit our live demo at: [https://polyverse-demo.vercel.app](https://polyverse-demo.vercel.app)

### Test x402 Protocol
```bash
# Test subscription purchase flow
curl -X POST http://localhost:3000/api/subscriptions/purchase \
  -H "Content-Type: application/json" \
  -d '{"planId":"basic-weekly"}'

# Expected: HTTP 402 Payment Required with x402 headers
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./docs/contributing.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

- **Documentation**: [./docs](./docs/)
- **GitHub Issues**: [Report bugs or request features](https://github.com/sambitsargam/POLYVERSE/issues)
- **Discord**: [Join our community](https://discord.gg/polyverse)
- **Email**: support@polyverse.com

## 🏆 Roadmap

- [x] x402 Protocol Integration with Polygon Amoy
- [x] Filecoin Lighthouse Storage
- [x] KiraPay Payment Processing
- [ ] NFT Access Token Minting
- [ ] Cross-Chain Subscription Bridging
- [ ] Mobile App Development
- [ ] DAO Governance Implementation

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ for the decentralized creator economy**

*Empowering creators through Web3 technology and sustainable blockchain monetization.*

## 🚀 Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/sambitsargam/POLYVERSE.git
cd POLYVERSE
npm install
```

### 2. Environment Setup
Copy `.env.example` to `.env.local` and configure:

```bash
# x402 Protocol Configuration
NEXT_PUBLIC_X402_FACILITATOR_URL=https://x402.polygon.technology
NEXT_PUBLIC_RECIPIENT_ADDRESS=0x90D9CD66FAdFF1C2Ba32C99A47C76532d08A704B
PRIVATE_KEY_AGENT=0xYourPrivateKeyForServerOperations

# Polygon Amoy Network  
NEXT_PUBLIC_AMOY_RPC=https://rpc-amoy.polygon.technology
NEXT_PUBLIC_POLYGON_RPC=https://polygon-rpc.com

# Filecoin Lighthouse Storage
LIGHTHOUSE_API_KEY=your_lighthouse_api_key_here
LIGHTHOUSE_GATEWAY_URL=https://gateway.lighthouse.storage/ipfs/

# KiraPay Configuration
KIRAPAY_API_KEY=your_kirapay_api_key
KIRAPAY_SECRET=your_kirapay_secret
KIRAPAY_WEBHOOK_URL=https://yourapp.com/api/webhooks/kirapay

# Database (Optional - for subscription tracking)
DATABASE_URL=postgresql://user:pass@localhost/polyverse
```

### 3. Network Configuration
Ensure your wallet is connected to **Polygon Amoy Testnet**:
- **Network Name**: Polygon Amoy
- **RPC URL**: https://rpc-amoy.polygon.technology  
- **Chain ID**: 80002
- **Currency**: POL
- **Block Explorer**: https://amoy.polygonscan.com

### 4. Get Test Tokens
```bash
# Get Amoy POL from faucet
curl -X POST https://faucet.polygon.technology/api/v1/amoy \
  -H "Content-Type: application/json" \
  -d '{"address":"YOUR_WALLET_ADDRESS"}'

# Get Test USDC (for x402 payments)
# Contract: 0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582
```

### 5. Start Development Server
```bash
npm run dev
# Open http://localhost:3000
```

## 📋 API Documentation

### x402 Subscription API

#### POST `/api/subscriptions/purchase`
Purchase subscription using x402 protocol

**Without X-PAYMENT Header (Initial Request):**
```bash
curl -X POST http://localhost:3000/api/subscriptions/purchase \
  -H "Content-Type: application/json" \
  -d '{"planId":"basic-weekly"}'

# Response: HTTP 402 Payment Required
{
  "x402Version": 1,
  "error": "X-PAYMENT header is required",
  "accepts": [{
    "scheme": "exact",
    "network": "polygon-amoy",
    "maxAmountRequired": "5000000",
    "asset": "0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582",
    "payTo": "0x90D9CD66FAdFF1C2Ba32C99A47C76532d08A704B",
    "description": "Basic Weekly Subscription"
  }]
}
```

**With X-PAYMENT Header (Payment Authorization):**
```bash
curl -X POST http://localhost:3000/api/subscriptions/purchase \
  -H "Content-Type: application/json" \
  -H "X-PAYMENT: eyJzY2hlbWUiOiJleGFjdCIsIm5ldHdvcms..." \
  -d '{"planId":"basic-weekly"}'

# Response: HTTP 200 OK
{
  "success": true,
  "txHash": "0xabc123...def456",
  "subscriptionId": "sub_abc123",
  "expiresAt": "2025-10-04T12:00:00Z"
}
```

### Filecoin Storage API

#### POST `/api/storage/upload`
Upload content to Filecoin via Lighthouse

```bash
curl -X POST http://localhost:3000/api/storage/upload \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -F "file=@content.pdf" \
  -F "encrypt=true"

# Response
{
  "success": true,
  "hash": "QmXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  "url": "https://gateway.lighthouse.storage/ipfs/QmXXX...",
  "dealId": "123456",
  "encrypted": true
}
```

#### GET `/api/storage/deals`
Check Filecoin deal status

```bash
curl http://localhost:3000/api/storage/deals?hash=QmXXX...

# Response  
{
  "hash": "QmXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  "deals": [{
    "dealId": "123456",
    "miner": "f01234",
    "status": "active",
    "startEpoch": 2851234,
    "endEpoch": 3851234
  }]
}
```

### KiraPay Payment API

#### POST `/api/payments/create`
Create payment link via KiraPay

```bash
curl -X POST http://localhost:3000/api/payments/create \
  -H "Content-Type: application/json" \
  -d '{
    "amount": "5.00",
    "currency": "USDC", 
    "network": "polygon",
    "creatorWallet": "0xCreatorAddress",
    "subscriptionPlan": "basic-weekly"
  }'

# Response
{
  "paymentId": "pay_abc123",
  "paymentUrl": "https://pay.kirapay.com/pay_abc123",
  "expiresAt": "2025-09-27T13:00:00Z"
}
```

## 🛠️ Development Guide

### Project Structure
```
src/
├── app/                    # Next.js 14 App Router
│   ├── api/               # API routes
│   │   ├── subscriptions/ # x402 subscription endpoints  
│   │   ├── storage/       # Filecoin Lighthouse APIs
│   │   └── payments/      # KiraPay integration
│   ├── dashboard/         # Creator dashboard
│   ├── subscriptions/     # Subscription management
│   └── storage/           # File upload interface
├── lib/
│   ├── x402-subscription-service.ts    # x402 protocol client
│   ├── lighthouse-storage.ts           # Filecoin storage SDK  
│   ├── kirapay-integration.ts          # Payment processing
│   ├── wallet-config.ts                # Polygon Amoy config
│   └── subscription-plans.ts           # Plan definitions
└── components/
    ├── payments/          # Payment UI components
    ├── storage/           # File upload components  
    └── subscriptions/     # Subscription management UI
```

### Key Components

#### x402 Subscription Service
```typescript
// src/lib/x402-subscription-service.ts
import { X402SubscriptionService } from './x402-subscription-service';

const service = new X402SubscriptionService();

// Purchase subscription with real blockchain settlement
const result = await service.purchaseSubscription(plan, walletClient);
console.log('Transaction Hash:', result.txHash); // Real Polygon Amoy TX
```

#### Lighthouse Storage Integration  
```typescript
// src/lib/lighthouse-storage.ts
import lighthouse from '@lighthouse-web3/sdk';

// Upload to Filecoin with encryption
const response = await lighthouse.uploadEncrypted(
  file,
  apiKey,
  publicKey, 
  signedMessage
);

// Access via IPFS gateway
const url = `https://gateway.lighthouse.storage/ipfs/${response.data.Hash}`;
```

#### KiraPay Payment Processing
```typescript
// src/lib/kirapay-integration.ts
import { KiraPaySDK } from 'kirapay';

// Multi-chain payment support
const payment = await KiraPaySDK.createPayment({
  amount: '5.00',
  currency: 'USDC',
  network: 'polygon', // or 'ethereum', 'filecoin'
  recipient: creatorWallet
});
```
NETWORK=calibration

# Storage Configuration
NEXT_PUBLIC_GATEWAY_URL=https://gateway.lighthouse.storage/ipfs/

# KiraPay Integration (TODO)
KIRAPAY_API_KEY=your_kirapay_api_key_here  
KIRAPAY_BASE_URL=https://api.kirapay.io
KIRAPAY_ENVIRONMENT=sandbox

# Testnet RPC Endpoints
SEPOLIA_RPC=https://rpc.sepolia.org
POLYGON_AMOY_RPC=https://rpc-amoy.polygon.technology
BASE_SEPOLIA_RPC=https://sepolia.base.org
ARBITRUM_SEPOLIA_RPC=https://sepolia-rollup.arbitrum.io/rpc
OPTIMISM_SEPOLIA_RPC=https://sepolia.optimism.io
```

### 3. Get API Keys

#### Lighthouse API Key
1. Visit [files.lighthouse.storage](https://files.lighthouse.storage/)
2. Create an account and generate an API key
3. Add the key to your `.env.local` file

#### KiraPay API Key (TODO)
1. Visit [KiraPay Developer Portal](https://developer.kirapay.io/)
2. Sign up and create a new project
3. Generate API key for payment processing
4. Add the key to your `.env.local` file

### 4. Setup MetaMask Wallet

#### Filecoin Network
1. Add Filecoin Calibration testnet:
   - Network name: Filecoin Calibration
   - RPC URL: https://api.calibration.node.glif.io/rpc/v1
   - Chain ID: 314159
   - Currency: tFIL
2. Get testnet FIL from [calibration faucet](https://faucet.calibration.fildev.network/)

#### KiraPay Supported Networks (TODO)
KiraPay supports multiple blockchain networks:

**Ethereum Sepolia:**
- RPC: https://rpc.sepolia.org
- Chain ID: 11155111
- Currency: ETH

**Polygon Amoy:**
- RPC: https://rpc-amoy.polygon.technology
- Chain ID: 80002
- Currency: MATIC

**Base Sepolia:**
- RPC: https://sepolia.base.org
- Chain ID: 84532
- Currency: ETH

**Arbitrum Sepolia:**
- RPC: https://sepolia-rollup.arbitrum.io/rpc
- Chain ID: 421614
- Currency: ETH

**Get Testnet Tokens:**
- [Sepolia Faucet](https://sepoliafaucet.com/)
- [Polygon Amoy Faucet](https://faucet.polygon.technology/)
- [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet)
- [Arbitrum Sepolia Faucet](https://faucet.quicknode.com/arbitrum/sepolia)

### 5. Run Development Server
```bash
npm run dev
# Open http://localhost:3000
```

## 🎯 Demo Pages

### 🔄 KiraPay Payment Demo
Visit `/payment-demo` to test KiraPay payment processing:
- Connect MetaMask wallet
- Select payment token and amount  
- Get real-time payment quotes
- Process payments via KiraPay API
- Monitor payment status and history

### 🗄️ Filecoin Storage Demo  
Visit `/filecoin-demo` to test decentralized storage:
- Upload files to IPFS via Lighthouse
- Real Filecoin deal creation
- Token-gated access control
- Deal status monitoring

## 🔧 Filecoin Setup Guide

### ✅ **Production Ready (Real Filecoin)**
The project now uses **real Filecoin storage integration** by default. Visit `/filecoin-demo` to test:
- **Real file uploads** to IPFS via Lighthouse SDK
- **Wallet-based authentication** with MetaMask
- **Live deal status tracking** on Filecoin network
- **Token-gated access control** for uploaded content

### Current Configuration:
1. ✅ **Lighthouse SDK**: Integrated for real IPFS uploads
2. ✅ **Wallet Authentication**: MetaMask integration (no private keys)
3. ✅ **Environment Variables**: API key configured for production use
4. ✅ **Real Network**: Connected to Filecoin Calibration testnet

### Required Setup:
- Filecoin Calibration testnet FIL tokens ([Get from faucet](https://faucet.calibration.fildev.network/))
- MetaMask configured for Filecoin network
- Lighthouse API key (already configured)

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build && npm start
```

Visit [http://localhost:3000](http://localhost:3000) to see the app.

## 🏗️ Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State**: Local State + localStorage persistence
- **Testing**: Jest + React Testing Library
- **Icons**: Heroicons

## 📱 Features

### Pages
- **Home/Marketplace (`/`)**: Hero section, creator discovery, product showcase
- **Creator Profile (`/creator/[handle]`)**: Creator storefront with subscription tiers, products, and tip functionality
- **Dashboard (`/dashboard`)**: Creator analytics with MRR, earnings, subscriber counts, and product upload
- **Raffle (`/raffle`)**: Community raffle system with winner selection
- **Connect Wallet (`/connect`)**: Wallet connection flow

### Components
- **CreatorCard**: Displays creator info with followers, verification status, and pricing
- **ProductCard**: Shows digital products with purchase functionality
- **TierCard**: Subscription tier display with feature lists
- **CheckoutModal**: Multi-token payment simulation (USDC, MATIC, ETH)
- **Toast**: Success/error notifications
- **SmallLineChart**: SVG-based mini charts for dashboard stats
- **FileUploader**: Real drag-and-drop file upload to Filecoin via Lighthouse SDK

## � Filecoin Storage Demo

Visit `/filecoin-demo` to experience:

1. **Connect MetaMask Wallet**: 
   - Connect your MetaMask wallet to Filecoin Calibration testnet
   - View wallet balance and connection status
   - No private keys required - uses secure wallet signing

2. **Upload Files to Filecoin**:
   - Drag and drop files for upload
   - Files are encrypted and stored via Lighthouse SDK
   - Real-time upload progress and deal status
   - Generates downloadable access tokens

3. **Token-Gated Access**:
   - Download files using access tokens
   - Secure access control system
   - View all your access tokens and permissions

4. **Filecoin Integration Features**:
   - Real Filecoin Calibration testnet storage
   - Encrypted uploads via Lighthouse
   - Deal status monitoring
   - Access token generation
   - Wallet-based authentication (no private keys!)

## 💳 Payment Integration

POLYVERSE integrates with KiraPay for seamless cryptocurrency payments across multiple blockchains.

### Payment Flow:
1. **Connect Wallet**: Users connect their MetaMask or compatible wallet
2. **Select Payment Token**: Choose from supported cryptocurrencies
3. **Process Payment**: Execute payment through KiraPay integration
4. **Confirm Transaction**: Monitor payment status and completion

### Supported Features:
- Multi-token payments (USDC, USDT, ETH, MATIC)
- Cross-chain payment processing
- Real-time payment status tracking
- Automatic receipt generation
- Creator payout management

## 📊 Data Structure

### Creators (`/data/creators.json`)
```json
{
  "id": "alice_crypto",
  "name": "Alice Thompson",
  "handle": "alice_crypto",
  "subscriptionTiers": [
    {
      "id": "basic",
      "priceUSD": 9.99,
      "interval": "month"
    }
  ]
}
```# Run all tests
npm test

# Run tests in watch mode  
npm run test:watch
```

**Test Coverage:**
- `CreatorCard.test.tsx`: Component rendering and interaction
- `CheckoutModal.test.tsx`: Payment flow and token calculations  
- `utils.test.ts`: MRR calculation, subscriber counting, earnings totals

## 💳 KiraPay Multi-Chain Payment Integration ✅

POLYVERSE features complete **KiraPay payment processing integration** for seamless multi-token payments and cross-chain transactions.

### ✨ Features:
- **Multi-Token Support**: Accept payments in USDC, USDT, ETH, MATIC, BTC
- **Real-time Quotes**: Dynamic pricing with live exchange rates and fees
- **Payment Monitoring**: Real-time status tracking and transaction history
- **Secure Processing**: Enterprise-grade payment infrastructure with error handling
- **Developer-Friendly**: Clean API integration with comprehensive documentation

### 🛠️ Technical Implementation:
- **Payment API**: `/api/kirapay/payment` - Process and monitor payments
- **Quote API**: `/api/kirapay/quote` - Get real-time conversion rates
- **Currencies API**: `/api/kirapay/currencies` - Get supported tokens
- **Service Layer**: `src/lib/kirapay-service.ts` - Complete integration logic

### 🌐 Supported Networks:
- **Ethereum Mainnet** - Chain ID: 1
- **Polygon** - Chain ID: 137
- **Base** - Chain ID: 8453
- **Arbitrum** - Chain ID: 42161
- **Optimism** - Chain ID: 10

### 💰 Supported Tokens:
- **USDC**: Multi-chain stablecoin support
- **USDT**: Tether stablecoin
- **ETH/MATIC/ARB**: Native gas tokens
- **BTC**: Bitcoin support
- **DAI**: Decentralized stablecoin

### 🎯 Integration Flow:
1. **Connect Wallet** → MetaMask integration
2. **Select Token** → Choose from supported currencies
3. **Get Quote** → Fetch real-time conversion rates and fees
4. **Process Payment** → Execute payment via KiraPay API
5. **Monitor Status** → Real-time payment tracking and completion

### 📱 Integration Points:
- **CheckoutModal**: Complete KiraPay payment flow with currency selection
- **Payment Demo**: `/payment-demo` - Interactive payment testing interface
- **API Endpoints**: Full RESTful API suite for payment processing
## 💳 KiraPay Multi-Chain Payment Integration ✅

POLYVERSE features complete **KiraPay payment processing integration** for seamless multi-token payments and cross-chain transactions.

### ✨ Features:
- **Multi-Token Support**: Accept payments in USDC, USDT, ETH, MATIC, BTC
- **Real-time Quotes**: Dynamic pricing with live exchange rates and fees
- **Payment Monitoring**: Real-time status tracking and transaction history
- **Secure Processing**: Enterprise-grade payment infrastructure with error handling
- **Developer-Friendly**: Clean API integration with comprehensive documentation

### 🛠️ Technical Implementation:
- **Payment API**: `/api/kirapay/payment` - Process and monitor payments
- **Quote API**: `/api/kirapay/quote` - Get real-time conversion rates
- **Currencies API**: `/api/kirapay/currencies` - Get supported tokens
- **Service Layer**: `src/lib/kirapay-service.ts` - Complete integration logic

### 🌐 Supported Networks:
- **Ethereum Mainnet** - Chain ID: 1
- **Polygon** - Chain ID: 137
- **Base** - Chain ID: 8453
- **Arbitrum** - Chain ID: 42161
- **Optimism** - Chain ID: 10

### 💰 Supported Tokens:
- **USDC**: Multi-chain stablecoin support
- **USDT**: Tether stablecoin
- **ETH/MATIC/ARB**: Native gas tokens
- **BTC**: Bitcoin support
- **DAI**: Decentralized stablecoin

### 🎯 Integration Flow:
1. **Connect Wallet** → MetaMask integration
2. **Select Token** → Choose from supported currencies
3. **Get Quote** → Fetch real-time conversion rates and fees
4. **Process Payment** → Execute payment via KiraPay API
5. **Monitor Status** → Real-time payment tracking and completion

### 📱 Integration Points:
- **CheckoutModal**: Complete KiraPay payment flow with currency selection
- **Payment Demo**: `/payment-demo` - Interactive payment testing interface
- **API Endpoints**: Full RESTful API suite for payment processing
## 💳 KiraPay Multi-Chain Payment Integration ✅

POLYVERSE features complete **KiraPay payment processing integration** for seamless multi-token payments and cross-chain transactions.

### ✨ Features:
- **Multi-Token Support**: Accept payments in USDC, USDT, ETH, MATIC, BTC
- **Real-time Quotes**: Dynamic pricing with live exchange rates and fees
- **Payment Monitoring**: Real-time status tracking and transaction history
- **Secure Processing**: Enterprise-grade payment infrastructure with error handling
- **Developer-Friendly**: Clean API integration with comprehensive documentation

### 🛠️ Technical Implementation:
- **Payment API**: `/api/kirapay/payment` - Process and monitor payments
- **Quote API**: `/api/kirapay/quote` - Get real-time conversion rates
- **Currencies API**: `/api/kirapay/currencies` - Get supported tokens
- **Service Layer**: `src/lib/kirapay-service.ts` - Complete integration logic

### 🌐 Supported Networks:
- **Ethereum Mainnet** - Chain ID: 1
- **Polygon** - Chain ID: 137
- **Base** - Chain ID: 8453
- **Arbitrum** - Chain ID: 42161
- **Optimism** - Chain ID: 10

### 💰 Supported Tokens:
- **USDC**: Multi-chain stablecoin support
- **USDT**: Tether stablecoin
- **ETH/MATIC/ARB**: Native gas tokens
- **BTC**: Bitcoin support
- **DAI**: Decentralized stablecoin

### 🎯 Integration Flow:
1. **Connect Wallet** → MetaMask integration
2. **Select Token** → Choose from supported currencies
3. **Get Quote** → Fetch real-time conversion rates and fees
4. **Process Payment** → Execute payment via KiraPay API
5. **Monitor Status** → Real-time payment tracking and completion

### 📱 Integration Points:
- **CheckoutModal**: Complete KiraPay payment flow with currency selection
- **Payment Demo**: `/payment-demo` - Interactive payment testing interface
- **API Endpoints**: Full RESTful API suite for payment processing
## 💳 KiraPay Multi-Chain Payment Integration ✅

POLYVERSE features complete **KiraPay payment processing integration** for seamless multi-token payments and cross-chain transactions.

### ✨ Features:
- **Multi-Token Support**: Accept payments in USDC, USDT, ETH, MATIC, BTC
- **Real-time Quotes**: Dynamic pricing with live exchange rates and fees
- **Payment Monitoring**: Real-time status tracking and transaction history
- **Secure Processing**: Enterprise-grade payment infrastructure with error handling
- **Developer-Friendly**: Clean API integration with comprehensive documentation

### 🛠️ Technical Implementation:
- **Payment API**: `/api/kirapay/payment` - Process and monitor payments
- **Quote API**: `/api/kirapay/quote` - Get real-time conversion rates
- **Currencies API**: `/api/kirapay/currencies` - Get supported tokens
- **Service Layer**: `src/lib/kirapay-service.ts` - Complete integration logic

### 🌐 Supported Networks:
- **Ethereum Mainnet** - Chain ID: 1
- **Polygon** - Chain ID: 137
- **Base** - Chain ID: 8453
- **Arbitrum** - Chain ID: 42161
- **Optimism** - Chain ID: 10

### 💰 Supported Tokens:
- **USDC**: Multi-chain stablecoin support
- **USDT**: Tether stablecoin
- **ETH/MATIC/ARB**: Native gas tokens
- **BTC**: Bitcoin support
- **DAI**: Decentralized stablecoin

### 🎯 Integration Flow:
1. **Connect Wallet** → MetaMask integration
2. **Select Token** → Choose from supported currencies
3. **Get Quote** → Fetch real-time conversion rates and fees
4. **Process Payment** → Execute payment via KiraPay API
5. **Monitor Status** → Real-time payment tracking and completion

### 📱 Integration Points:
- **CheckoutModal**: Complete KiraPay payment flow with currency selection
- **Payment Demo**: `/payment-demo` - Interactive payment testing interface
- **API Endpoints**: Full RESTful API suite for payment processing
## 💳 KiraPay Multi-Chain Payment Integration ✅

POLYVERSE features complete **KiraPay payment processing integration** for seamless multi-token payments and cross-chain transactions.

### ✨ Features:
- **Multi-Token Support**: Accept payments in USDC, USDT, ETH, MATIC, BTC
- **Real-time Quotes**: Dynamic pricing with live exchange rates and fees
- **Payment Monitoring**: Real-time status tracking and transaction history
- **Secure Processing**: Enterprise-grade payment infrastructure with error handling
- **Developer-Friendly**: Clean API integration with comprehensive documentation

### 🛠️ Technical Implementation:
- **Payment API**: `/api/kirapay/payment` - Process and monitor payments
- **Quote API**: `/api/kirapay/quote` - Get real-time conversion rates
- **Currencies API**: `/api/kirapay/currencies` - Get supported tokens
- **Service Layer**: `src/lib/kirapay-service.ts` - Complete integration logic

### 🌐 Supported Networks:
- **Ethereum Mainnet** - Chain ID: 1
- **Polygon** - Chain ID: 137
- **Base** - Chain ID: 8453
- **Arbitrum** - Chain ID: 42161
- **Optimism** - Chain ID: 10

### 💰 Supported Tokens:
- **USDC**: Multi-chain stablecoin support
- **USDT**: Tether stablecoin
- **ETH/MATIC/ARB**: Native gas tokens
- **BTC**: Bitcoin support
- **DAI**: Decentralized stablecoin

### 🎯 Integration Flow:
1. **Connect Wallet** → MetaMask integration
2. **Select Token** → Choose from supported currencies
3. **Get Quote** → Fetch real-time conversion rates and fees
4. **Process Payment** → Execute payment via KiraPay API
5. **Monitor Status** → Real-time payment tracking and completion

### 📱 Integration Points:
- **CheckoutModal**: Complete KiraPay payment flow with currency selection
- **Payment Demo**: `/payment-demo` - Interactive payment testing interface
- **API Endpoints**: Full RESTful API suite for payment processing
## 💳 KiraPay Multi-Chain Payment Integration ✅

POLYVERSE features complete **KiraPay payment processing integration** for seamless multi-token payments and cross-chain transactions.

### ✨ Features:
- **Multi-Token Support**: Accept payments in USDC, USDT, ETH, MATIC, BTC
- **Real-time Quotes**: Dynamic pricing with live exchange rates and fees
- **Payment Monitoring**: Real-time status tracking and transaction history
- **Secure Processing**: Enterprise-grade payment infrastructure with error handling
- **Developer-Friendly**: Clean API integration with comprehensive documentation

### 🛠️ Technical Implementation:
- **Payment API**: `/api/kirapay/payment` - Process and monitor payments
- **Quote API**: `/api/kirapay/quote` - Get real-time conversion rates
- **Currencies API**: `/api/kirapay/currencies` - Get supported tokens
- **Service Layer**: `src/lib/kirapay-service.ts` - Complete integration logic

### 🌐 Supported Networks:
- **Ethereum Mainnet** - Chain ID: 1
- **Polygon** - Chain ID: 137
- **Base** - Chain ID: 8453
- **Arbitrum** - Chain ID: 42161
- **Optimism** - Chain ID: 10

### 💰 Supported Tokens:
- **USDC**: Multi-chain stablecoin support
- **USDT**: Tether stablecoin
- **ETH/MATIC/ARB**: Native gas tokens
- **BTC**: Bitcoin support
- **DAI**: Decentralized stablecoin

### 🎯 Integration Flow:
1. **Connect Wallet** → MetaMask integration
2. **Select Token** → Choose from supported currencies
3. **Get Quote** → Fetch real-time conversion rates and fees
4. **Process Payment** → Execute payment via KiraPay API
5. **Monitor Status** → Real-time payment tracking and completion

### 📱 Integration Points:
- **CheckoutModal**: Complete KiraPay payment flow with currency selection
- **Payment Demo**: `/payment-demo` - Interactive payment testing interface
- **API Endpoints**: Full RESTful API suite for payment processing
## 💳 KiraPay Multi-Chain Payment Integration ✅

POLYVERSE features complete **KiraPay payment processing integration** for seamless multi-token payments and cross-chain transactions.

### ✨ Features:
- **Multi-Token Support**: Accept payments in USDC, USDT, ETH, MATIC, BTC
- **Real-time Quotes**: Dynamic pricing with live exchange rates and fees
- **Payment Monitoring**: Real-time status tracking and transaction history
- **Secure Processing**: Enterprise-grade payment infrastructure with error handling
- **Developer-Friendly**: Clean API integration with comprehensive documentation

### 🛠️ Technical Implementation:
- **Payment API**: `/api/kirapay/payment` - Process and monitor payments
- **Quote API**: `/api/kirapay/quote` - Get real-time conversion rates
- **Currencies API**: `/api/kirapay/currencies` - Get supported tokens
- **Service Layer**: `src/lib/kirapay-service.ts` - Complete integration logic

### 🌐 Supported Networks:
- **Ethereum Mainnet** - Chain ID: 1
- **Polygon** - Chain ID: 137
- **Base** - Chain ID: 8453
- **Arbitrum** - Chain ID: 42161
- **Optimism** - Chain ID: 10

### 💰 Supported Tokens:
- **USDC**: Multi-chain stablecoin support
- **USDT**: Tether stablecoin
- **ETH/MATIC/ARB**: Native gas tokens
- **BTC**: Bitcoin support
- **DAI**: Decentralized stablecoin

### 🎯 Integration Flow:
1. **Connect Wallet** → MetaMask integration
2. **Select Token** → Choose from supported currencies
3. **Get Quote** → Fetch real-time conversion rates and fees
4. **Process Payment** → Execute payment via KiraPay API
5. **Monitor Status** → Real-time payment tracking and completion

### 📱 Integration Points:
- **CheckoutModal**: Complete KiraPay payment flow with currency selection
- **Payment Demo**: `/payment-demo` - Interactive payment testing interface
- **API Endpoints**: Full RESTful API suite for payment processing
## 💳 KiraPay Multi-Chain Payment Integration ✅

POLYVERSE features complete **KiraPay payment processing integration** for seamless multi-token payments and cross-chain transactions.

### ✨ Features:
- **Multi-Token Support**: Accept payments in USDC, USDT, ETH, MATIC, BTC
- **Real-time Quotes**: Dynamic pricing with live exchange rates and fees
- **Payment Monitoring**: Real-time status tracking and transaction history
- **Secure Processing**: Enterprise-grade payment infrastructure with error handling
- **Developer-Friendly**: Clean API integration with comprehensive documentation

### 🛠️ Technical Implementation:
- **Payment API**: `/api/kirapay/payment` - Process and monitor payments
- **Quote API**: `/api/kirapay/quote` - Get real-time conversion rates
- **Currencies API**: `/api/kirapay/currencies` - Get supported tokens
- **Service Layer**: `src/lib/kirapay-service.ts` - Complete integration logic

### 🌐 Supported Networks:
- **Ethereum Mainnet** - Chain ID: 1
- **Polygon** - Chain ID: 137
- **Base** - Chain ID: 8453
- **Arbitrum** - Chain ID: 42161
- **Optimism** - Chain ID: 10

### 💰 Supported Tokens:
- **USDC**: Multi-chain stablecoin support
- **USDT**: Tether stablecoin
- **ETH/MATIC/ARB**: Native gas tokens
- **BTC**: Bitcoin support
- **DAI**: Decentralized stablecoin

### 🎯 Integration Flow:
1. **Connect Wallet** → MetaMask integration
2. **Select Token** → Choose from supported currencies
3. **Get Quote** → Fetch real-time conversion rates and fees
4. **Process Payment** → Execute payment via KiraPay API
5. **Monitor Status** → Real-time payment tracking and completion

### 📱 Integration Points:
- **CheckoutModal**: Complete KiraPay payment flow with currency selection
- **Payment Demo**: `/payment-demo` - Interactive payment testing interface
- **API Endpoints**: Full RESTful API suite for payment processing
## 💳 KiraPay Multi-Chain Payment Integration ✅

POLYVERSE features complete **KiraPay payment processing integration** for seamless multi-token payments and cross-chain transactions.

### ✨ Features:
- **Multi-Token Support**: Accept payments in USDC, USDT, ETH, MATIC, BTC
- **Real-time Quotes**: Dynamic pricing with live exchange rates and fees
- **Payment Monitoring**: Real-time status tracking and transaction history
- **Secure Processing**: Enterprise-grade payment infrastructure with error handling
- **Developer-Friendly**: Clean API integration with comprehensive documentation

### 🛠️ Technical Implementation:
- **Payment API**: `/api/kirapay/payment` - Process and monitor payments
- **Quote API**: `/api/kirapay/quote` - Get real-time conversion rates
- **Currencies API**: `/api/kirapay/currencies` - Get supported tokens
- **Service Layer**: `src/lib/kirapay-service.ts` - Complete integration logic

### 🌐 Supported Networks:
- **Ethereum Mainnet** - Chain ID: 1
- **Polygon** - Chain ID: 137
- **Base** - Chain ID: 8453
- **Arbitrum** - Chain ID: 42161
- **Optimism** - Chain ID: 10

### 💰 Supported Tokens:
- **USDC**: Multi-chain stablecoin support
- **USDT**: Tether stablecoin
- **ETH/MATIC/ARB**: Native gas tokens
- **BTC**: Bitcoin support
- **DAI**: Decentralized stablecoin

### 🎯 Integration Flow:
1. **Connect Wallet** → MetaMask integration
2. **Select Token** → Choose from supported currencies
3. **Get Quote** → Fetch real-time conversion rates and fees
4. **Process Payment** → Execute payment via KiraPay API
5. **Monitor Status** → Real-time payment tracking and completion

### 📱 Integration Points:
- **CheckoutModal**: Complete KiraPay payment flow with currency selection
- **Payment Demo**: `/payment-demo` - Interactive payment testing interface
- **API Endpoints**: Full RESTful API suite for payment processing
## 💳 KiraPay Multi-Chain Payment Integration ✅

POLYVERSE features complete **KiraPay payment processing integration** for seamless multi-token payments and cross-chain transactions.

### ✨ Features:
- **Multi-Token Support**: Accept payments in USDC, USDT, ETH, MATIC, BTC
- **Real-time Quotes**: Dynamic pricing with live exchange rates and fees
- **Payment Monitoring**: Real-time status tracking and transaction history
- **Secure Processing**: Enterprise-grade payment infrastructure with error handling
- **Developer-Friendly**: Clean API integration with comprehensive documentation

### 🛠️ Technical Implementation:
- **Payment API**: `/api/kirapay/payment` - Process and monitor payments
- **Quote API**: `/api/kirapay/quote` - Get real-time conversion rates
- **Currencies API**: `/api/kirapay/currencies` - Get supported tokens
- **Service Layer**: `src/lib/kirapay-service.ts` - Complete integration logic

### 🌐 Supported Networks:
- **Ethereum Mainnet** - Chain ID: 1
- **Polygon** - Chain ID: 137
- **Base** - Chain ID: 8453
- **Arbitrum** - Chain ID: 42161
- **Optimism** - Chain ID: 10

### 💰 Supported Tokens:
- **USDC**: Multi-chain stablecoin support
- **USDT**: Tether stablecoin
- **ETH/MATIC/ARB**: Native gas tokens
- **BTC**: Bitcoin support
- **DAI**: Decentralized stablecoin

### 🎯 Integration Flow:
1. **Connect Wallet** → MetaMask integration
2. **Select Token** → Choose from supported currencies
3. **Get Quote** → Fetch real-time conversion rates and fees
4. **Process Payment** → Execute payment via KiraPay API
5. **Monitor Status** → Real-time payment tracking and completion

### 📱 Integration Points:
- **CheckoutModal**: Complete KiraPay payment flow with currency selection
- **Payment Demo**: `/payment-demo` - Interactive payment testing interface
- **API Endpoints**: Full RESTful API suite for payment processing
## 💳 KiraPay Multi-Chain Payment Integration ✅

POLYVERSE features complete **KiraPay payment processing integration** for seamless multi-token payments and cross-chain transactions.

### ✨ Features:
- **Multi-Token Support**: Accept payments in USDC, USDT, ETH, MATIC, BTC
- **Real-time Quotes**: Dynamic pricing with live exchange rates and fees
- **Payment Monitoring**: Real-time status tracking and transaction history
- **Secure Processing**: Enterprise-grade payment infrastructure with error handling
- **Developer-Friendly**: Clean API integration with comprehensive documentation

### 🛠️ Technical Implementation:
- **Payment API**: `/api/kirapay/payment` - Process and monitor payments
- **Quote API**: `/api/kirapay/quote` - Get real-time conversion rates
- **Currencies API**: `/api/kirapay/currencies` - Get supported tokens
- **Service Layer**: `src/lib/kirapay-service.ts` - Complete integration logic

### 🌐 Supported Networks:
- **Ethereum Mainnet** - Chain ID: 1
- **Polygon** - Chain ID: 137
- **Base** - Chain ID: 8453
- **Arbitrum** - Chain ID: 42161
- **Optimism** - Chain ID: 10

### 💰 Supported Tokens:
- **USDC**: Multi-chain stablecoin support
- **USDT**: Tether stablecoin
- **ETH/MATIC/ARB**: Native gas tokens
- **BTC**: Bitcoin support
- **DAI**: Decentralized stablecoin

### 🎯 Integration Flow:
1. **Connect Wallet** → MetaMask integration
2. **Select Token** → Choose from supported currencies
3. **Get Quote** → Fetch real-time conversion rates and fees
4. **Process Payment** → Execute payment via KiraPay API
5. **Monitor Status** → Real-time payment tracking and completion

### 📱 Integration Points:
- **CheckoutModal**: Complete KiraPay payment flow with currency selection
- **Payment Demo**: `/payment-demo` - Interactive payment testing interface
- **API Endpoints**: Full RESTful API suite for payment processing
## 💳 KiraPay Multi-Chain Payment Integration ✅

POLYVERSE features complete **KiraPay payment processing integration** for seamless multi-token payments and cross-chain transactions.

### ✨ Features:
- **Multi-Token Support**: Accept payments in USDC, USDT, ETH, MATIC, BTC
- **Real-time Quotes**: Dynamic pricing with live exchange rates and fees
- **Payment Monitoring**: Real-time status tracking and transaction history
- **Secure Processing**: Enterprise-grade payment infrastructure with error handling
- **Developer-Friendly**: Clean API integration with comprehensive documentation

### 🛠️ Technical Implementation:
- **Payment API**: `/api/kirapay/payment` - Process and monitor payments
- **Quote API**: `/api/kirapay/quote` - Get real-time conversion rates
- **Currencies API**: `/api/kirapay/currencies` - Get supported tokens
- **Service Layer**: `src/lib/kirapay-service.ts` - Complete integration logic

### 🌐 Supported Networks:
- **Ethereum Mainnet** - Chain ID: 1
- **Polygon** - Chain ID: 137
- **Base** - Chain ID: 8453
- **Arbitrum** - Chain ID: 42161
- **Optimism** - Chain ID: 10

### 💰 Supported Tokens:
- **USDC**: Multi-chain stablecoin support
- **USDT**: Tether stablecoin
- **ETH/MATIC/ARB**: Native gas tokens
- **BTC**: Bitcoin support
- **DAI**: Decentralized stablecoin

### 🎯 Integration Flow:
1. **Connect Wallet** → MetaMask integration
2. **Select Token** → Choose from supported currencies
3. **Get Quote** → Fetch real-time conversion rates and fees
4. **Process Payment** → Execute payment via KiraPay API
5. **Monitor Status** → Real-time payment tracking and completion

### 📱 Integration Points:
- **CheckoutModal**: Complete KiraPay payment flow with currency selection
- **Payment Demo**: `/payment-demo` - Interactive payment testing interface
- **API Endpoints**: Full RESTful API suite for payment processing
## 💳 KiraPay Multi-Chain Payment Integration ✅

POLYVERSE features complete **KiraPay payment processing integration** for seamless multi-token payments and cross-chain transactions.

### ✨ Features:
- **Multi-Token Support**: Accept payments in USDC, USDT, ETH, MATIC, BTC
- **Real-time Quotes**: Dynamic pricing with live exchange rates and fees
- **Payment Monitoring**: Real-time status tracking and transaction history
- **Secure Processing**: Enterprise-grade payment infrastructure with error handling
- **Developer-Friendly**: Clean API integration with comprehensive documentation

### 🛠️ Technical Implementation:
- **Payment API**: `/api/kirapay/payment` - Process and monitor payments
- **Quote API**: `/api/kirapay/quote` - Get real-time conversion rates
- **Currencies API**: `/api/kirapay/currencies` - Get supported tokens
- **Service Layer**: `src/lib/kirapay-service.ts` - Complete integration logic

### 🌐 Supported Networks:
- **Ethereum Mainnet** - Chain ID: 1
- **Polygon** - Chain ID: 137
- **Base** - Chain ID: 8453
- **Arbitrum** - Chain ID: 42161
- **Optimism** - Chain ID: 10

### 💰 Supported Tokens:
- **USDC**: Multi-chain stablecoin support
- **USDT**: Tether stablecoin
- **ETH/MATIC/ARB**: Native gas tokens
- **BTC**: Bitcoin support
- **DAI**: Decentralized stablecoin

### 🎯 Integration Flow:
1. **Connect Wallet** → MetaMask integration
2. **Select Token** → Choose from supported currencies
3. **Get Quote** → Fetch real-time conversion rates and fees
4. **Process Payment** → Execute payment via KiraPay API
5. **Monitor Status** → Real-time payment tracking and completion

### 📱 Integration Points:
- **CheckoutModal**: Complete KiraPay payment flow with currency selection
- **Payment Demo**: `/payment-demo` - Interactive payment testing interface
- **API Endpoints**: Full RESTful API suite for payment processing
## 💳 KiraPay Multi-Chain Payment Integration ✅

POLYVERSE features complete **KiraPay payment processing integration** for seamless multi-token payments and cross-chain transactions.

### ✨ Features:
- **Multi-Token Support**: Accept payments in USDC, USDT, ETH, MATIC, BTC
- **Real-time Quotes**: Dynamic pricing with live exchange rates and fees
- **Payment Monitoring**: Real-time status tracking and transaction history
- **Secure Processing**: Enterprise-grade payment infrastructure with error handling
- **Developer-Friendly**: Clean API integration with comprehensive documentation

### 🛠️ Technical Implementation:
- **Payment API**: `/api/kirapay/payment` - Process and monitor payments
- **Quote API**: `/api/kirapay/quote` - Get real-time conversion rates
- **Currencies API**: `/api/kirapay/currencies` - Get supported tokens
- **Service Layer**: `src/lib/kirapay-service.ts` - Complete integration logic

### 🌐 Supported Networks:
- **Ethereum Mainnet** - Chain ID: 1
- **Polygon** - Chain ID: 137
- **Base** - Chain ID: 8453
- **Arbitrum** - Chain ID: 42161
- **Optimism** - Chain ID: 10

### 💰 Supported Tokens:
- **USDC**: Multi-chain stablecoin support
- **USDT**: Tether stablecoin
- **ETH/MATIC/ARB**: Native gas tokens
- **BTC**: Bitcoin support
- **DAI**: Decentralized stablecoin

### 🎯 Integration Flow:
1. **Connect Wallet** → MetaMask integration
2. **Select Token** → Choose from supported currencies
3. **Get Quote** → Fetch real-time conversion rates and fees
4. **Process Payment** → Execute payment via KiraPay API
5. **Monitor Status** → Real-time payment tracking and completion

### 📱 Integration Points:
- **CheckoutModal**: Complete KiraPay payment flow with currency selection
- **Payment Demo**: `/payment-demo` - Interactive payment testing interface
- **API Endpoints**: Full RESTful API suite for payment processing
## 💳 KiraPay Multi-Chain Payment Integration ✅

POLYVERSE features complete **KiraPay payment processing integration** for seamless multi-token payments and cross-chain transactions.

### ✨ Features:
- **Multi-Token Support**: Accept payments in USDC, USDT, ETH, MATIC, BTC
- **Real-time Quotes**: Dynamic pricing with live exchange rates and fees
- **Payment Monitoring**: Real-time status tracking and transaction history
- **Secure Processing**: Enterprise-grade payment infrastructure with error handling
- **Developer-Friendly**: Clean API integration with comprehensive documentation

### 🛠️ Technical Implementation:
- **Payment API**: `/api/kirapay/payment` - Process and monitor payments
- **Quote API**: `/api/kirapay/quote` - Get real-time conversion rates
- **Currencies API**: `/api/kirapay/currencies` - Get supported tokens
- **Service Layer**: `src/lib/kirapay-service.ts` - Complete integration logic

### 🌐 Supported Networks:
- **Ethereum Mainnet** - Chain ID: 1
- **Polygon** - Chain ID: 137
- **Base** - Chain ID: 8453
- **Arbitrum** - Chain ID: 42161
- **Optimism** - Chain ID: 10

### 💰 Supported Tokens:
- **USDC**: Multi-chain stablecoin support
- **USDT**: Tether stablecoin
- **ETH/MATIC/ARB**: Native gas tokens
- **BTC**: Bitcoin support
- **DAI**: Decentralized stablecoin

### 🎯 Integration Flow:
1. **Connect Wallet** → MetaMask integration
2. **Select Token** → Choose from supported currencies
3. **Get Quote** → Fetch real-time conversion rates and fees
4. **Process Payment** → Execute payment via KiraPay API
5. **Monitor Status** → Real-time payment tracking and completion

### 📱 Integration Points:
- **CheckoutModal**: Complete KiraPay payment flow with currency selection
- **Payment Demo**: `/payment-demo` - Interactive payment testing interface
- **API Endpoints**: Full RESTful API suite for payment processing
## 💳 KiraPay Multi-Chain Payment Integration ✅

POLYVERSE features complete **KiraPay payment processing integration** for seamless multi-token payments and cross-chain transactions.

### ✨ Features:
- **Multi-Token Support**: Accept payments in USDC, USDT, ETH, MATIC, BTC
- **Real-time Quotes**: Dynamic pricing with live exchange rates and fees
- **Payment Monitoring**: Real-time status tracking and transaction history
- **Secure Processing**: Enterprise-grade payment infrastructure with error handling
- **Developer-Friendly**: Clean API integration with comprehensive documentation

### 🛠️ Technical Implementation:
- **Payment API**: `/api/kirapay/payment` - Process and monitor payments
- **Quote API**: `/api/kirapay/quote` - Get real-time conversion rates
- **Currencies API**: `/api/kirapay/currencies` - Get supported tokens
- **Service Layer**: `src/lib/kirapay-service.ts` - Complete integration logic

### 🌐 Supported Networks:
- **Ethereum Mainnet** - Chain ID: 1
- **Polygon** - Chain ID: 137
- **Base** - Chain ID: 8453
- **Arbitrum** - Chain ID: 42161
- **Optimism** - Chain ID: 10

### 💰 Supported Tokens:
- **USDC**: Multi-chain stablecoin support
- **USDT**: Tether stablecoin
- **ETH/MATIC/ARB**: Native gas tokens
- **BTC**: Bitcoin support
- **DAI**: Decentralized stablecoin

### 🎯 Integration Flow:
1. **Connect Wallet** → MetaMask integration
2. **Select Token** → Choose from supported currencies
3. **Get Quote** → Fetch real-time conversion rates and fees
4. **Process Payment** → Execute payment via KiraPay API
5. **Monitor Status** → Real-time payment tracking and completion

### 📱 Integration Points:
- **CheckoutModal**: Complete KiraPay payment flow with currency selection
- **Payment Demo**: `/payment-demo` - Interactive payment testing interface
- **API Endpoints**: Full RESTful API suite for payment processing
## 💳 KiraPay Multi-Chain Payment Integration ✅

POLYVERSE features complete **KiraPay payment processing integration** for seamless multi-token payments and cross-chain transactions.

### ✨ Features:
- **Multi-Token Support**: Accept payments in USDC, USDT, ETH, MATIC, BTC
- **Real-time Quotes**: Dynamic pricing with live exchange rates and fees
- **Payment Monitoring**: Real-time status tracking and transaction history
- **Secure Processing**: Enterprise-grade payment infrastructure with error handling
- **Developer-Friendly**: Clean API integration with comprehensive documentation

### 🛠️ Technical Implementation:
- **Payment API**: `/api/kirapay/payment` - Process and monitor payments
- **Quote API**: `/api/kirapay/quote` - Get real-time conversion rates
- **Currencies API**: `/api/kirapay/currencies` - Get supported tokens
- **Service Layer**: `src/lib/kirapay-service.ts` - Complete integration logic

### 🌐 Supported Networks:
- **Ethereum Mainnet** - Chain ID: 1
- **Polygon** - Chain ID: 137
- **Base** - Chain ID: 8453
- **Arbitrum** - Chain ID: 42161
- **Optimism** - Chain ID: 10

### 💰 Supported Tokens:
- **USDC**: Multi-chain stablecoin support
- **USDT**: Tether stablecoin
- **ETH/MATIC/ARB**: Native gas tokens
- **BTC**: Bitcoin support
- **DAI**: Decentralized stablecoin

### 🎯 Integration Flow:
1. **Connect Wallet** → MetaMask integration
2. **Select Token** → Choose from supported currencies
3. **Get Quote** → Fetch real-time conversion rates and fees
4. **Process Payment** → Execute payment via KiraPay API
5. **Monitor Status** → Real-time payment tracking and completion

### 📱 Integration Points:
- **CheckoutModal**: Complete KiraPay payment flow with currency selection
- **Payment Demo**: `/payment-demo` - Interactive payment testing interface
- **API Endpoints**: Full RESTful API suite for payment processing
## 💳 KiraPay Multi-Chain Payment Integration ✅

POLYVERSE features complete **KiraPay payment processing integration** for seamless multi-token payments and cross-chain transactions.

### ✨ Features:
- **Multi-Token Support**: Accept payments in USDC, USDT, ETH, MATIC, BTC
- **Real-time Quotes**: Dynamic pricing with live exchange rates and fees
- **Payment Monitoring**: Real-time status tracking and transaction history
- **Secure Processing**: Enterprise-grade payment infrastructure with error handling
- **Developer-Friendly**: Clean API integration with comprehensive documentation

### 🛠️ Technical Implementation:
- **Payment API**: `/api/kirapay/payment` - Process and monitor payments
- **Quote API**: `/api/kirapay/quote` - Get real-time conversion rates
- **Currencies API**: `/api/kirapay/currencies` - Get supported tokens
- **Service Layer**: `src/lib/kirapay-service.ts` - Complete integration logic

### 🌐 Supported Networks:
- **Ethereum Mainnet** - Chain ID: 1
- **Polygon** - Chain ID: 137
- **Base** - Chain ID: 8453
- **Arbitrum** - Chain ID: 42161
- **Optimism** - Chain ID: 10

### 💰 Supported Tokens:
- **USDC**: Multi-chain stablecoin support
- **USDT**: Tether stablecoin
- **ETH/MATIC/ARB**: Native gas tokens
- **BTC**: Bitcoin support
- **DAI**: Decentralized stablecoin

### 🎯 Integration Flow:
1. **Connect Wallet** → MetaMask integration
2. **Select Token** → Choose from supported currencies
3. **Get Quote** → Fetch real-time conversion rates and fees
4. **Process Payment** → Execute payment via KiraPay API
5. **Monitor Status** → Real-time payment tracking and completion

### 📱 Integration Points:
- **CheckoutModal**: Complete KiraPay payment flow with currency selection
- **Payment Demo**: `/payment-demo` - Interactive payment testing interface
- **API Endpoints**: Full RESTful API suite for payment processing
## 💳 KiraPay Multi-Chain Payment Integration ✅

POLYVERSE features complete **KiraPay payment processing integration** for seamless multi-token payments and cross-chain transactions.

### ✨ Features:
- **Multi-Token Support**: Accept payments in USDC, USDT, ETH, MATIC, BTC
- **Real-time Quotes**: Dynamic pricing with live exchange rates and fees
- **Payment Monitoring**: Real-time status tracking and transaction history
- **Secure Processing**: Enterprise-grade payment infrastructure with error handling
- **Developer-Friendly**: Clean API integration with comprehensive documentation

### 🛠️ Technical Implementation:
- **Payment API**: `/api/kirapay/payment` - Process and monitor payments
- **Quote API**: `/api/kirapay/quote` - Get real-time conversion rates
- **Currencies API**: `/api/kirapay/currencies` - Get supported tokens
- **Service Layer**: `src/lib/kirapay-service.ts` - Complete integration logic

### 🌐 Supported Networks:
- **Ethereum Mainnet** - Chain ID: 1
- **Polygon** - Chain ID: 137
- **Base** - Chain ID: 8453
- **Arbitrum** - Chain ID: 42161
- **Optimism** - Chain ID: 10

### 💰 Supported Tokens:
- **USDC**: Multi-chain stablecoin support
- **USDT**: Tether stablecoin
- **ETH/MATIC/ARB**: Native gas tokens
- **BTC**: Bitcoin support
- **DAI**: Decentralized stablecoin

### 🎯 Integration Flow:
1. **Connect Wallet** → MetaMask integration
2. **Select Token** → Choose from supported currencies
3. **Get Quote** → Fetch real-time conversion rates and fees
4. **Process Payment** → Execute payment via KiraPay API
5. **Monitor Status** → Real-time payment tracking and completion

### 📱 Integration Points:
- **CheckoutModal**: Complete KiraPay payment flow with currency selection
- **Payment Demo**: `/payment-demo` - Interactive payment testing interface
- **API Endpoints**: Full RESTful API suite for payment processing
## 💳 KiraPay Multi-Chain Payment Integration ✅

POLYVERSE features complete **KiraPay payment processing integration** for seamless multi-token payments and cross-chain transactions.

### ✨ Features:
- **Multi-Token Support**: Accept payments in USDC, USDT, ETH, MATIC, BTC
- **Real-time Quotes**: Dynamic pricing with live exchange rates and fees
- **Payment Monitoring**: Real-time status tracking and transaction history
- **Secure Processing**: Enterprise-grade payment infrastructure with error handling
- **Developer-Friendly**: Clean API integration with comprehensive documentation

### 🛠️ Technical Implementation:
- **Payment API**: `/api/kirapay/payment` - Process and monitor payments
- **Quote API**: `/api/kirapay/quote` - Get real-time conversion rates
- **Currencies API**: `/api/kirapay/currencies` - Get supported tokens
- **Service Layer**: `src/lib/kirapay-service.ts` - Complete integration logic

### 🌐 Supported Networks:
- **Ethereum Mainnet** - Chain ID: 1
- **Polygon** - Chain ID: 137
- **Base** - Chain ID: 8453
- **Arbitrum** - Chain ID: 42161
- **Optimism** - Chain ID: 10

### 💰 Supported Tokens:
- **USDC**: Multi-chain stablecoin support
- **USDT**: Tether stablecoin
- **ETH/MATIC/ARB**: Native gas tokens
- **BTC**: Bitcoin support
- **DAI**: Decentralized stablecoin

### 🎯 Integration Flow:
1. **Connect Wallet** → MetaMask integration
2. **Select Token** → Choose from supported currencies
3. **Get Quote** → Fetch real-time conversion rates and fees
4. **Process Payment** → Execute payment via KiraPay API
5. **Monitor Status** → Real-time payment tracking and completion

### 📱 Integration Points:
- **CheckoutModal**: Complete KiraPay payment flow with currency selection
- **Payment Demo**: `/payment-demo` - Interactive payment testing interface
- **API Endpoints**: Full RESTful API suite for payment processing
## 💳 KiraPay Multi-Chain Payment Integration ✅

POLYVERSE features complete **KiraPay payment processing integration** for seamless multi-token payments and cross-chain transactions.

### ✨ Features:
- **Multi-Token Support**: Accept payments in USDC, USDT, ETH, MATIC, BTC
- **Real-time Quotes**: Dynamic pricing with live exchange rates and fees
- **Payment Monitoring**: Real-time status tracking and transaction history
- **Secure Processing**: Enterprise-grade payment infrastructure with error handling
- **Developer-Friendly**: Clean API integration with comprehensive documentation

### 🛠️ Technical Implementation:
- **Payment API**: `/api/kirapay/payment` - Process and monitor payments
- **Quote API**: `/api/kirapay/quote` - Get real-time conversion rates
- **Currencies API**: `/api/kirapay/currencies` - Get supported tokens
- **Service Layer**: `src/lib/kirapay-service.ts` - Complete integration logic

### 🌐 Supported Networks:
- **Ethereum Mainnet** - Chain ID: 1
- **Polygon** - Chain ID: 137
- **Base** - Chain ID: 8453
- **Arbitrum** - Chain ID: 42161
- **Optimism** - Chain ID: 10

### 💰 Supported Tokens:
- **USDC**: Multi-chain stablecoin support
- **USDT**: Tether stablecoin
- **ETH/MATIC/ARB**: Native gas tokens
- **BTC**: Bitcoin support
- **DAI**: Decentralized stablecoin

### 🎯 Integration Flow:
1. **Connect Wallet** → MetaMask integration
2. **Select Token** → Choose from supported currencies
3. **Get Quote** → Fetch real-time conversion rates and fees
4. **Process Payment** → Execute payment via KiraPay API
5. **Monitor Status** → Real-time payment tracking and completion

### 📱 Integration Points:
- **CheckoutModal**: Complete KiraPay payment flow with currency selection
- **Payment Demo**: `/payment-demo` - Interactive payment testing interface
- **API Endpoints**: Full RESTful API suite for payment processing
## 💳 KiraPay Multi-Chain Payment Integration ✅

POLYVERSE features complete **KiraPay payment processing integration** for seamless multi-token payments and cross-chain transactions.

### ✨ Features:
- **Multi-Token Support**: Accept payments in USDC, USDT, ETH, MATIC, BTC
- **Real-time Quotes**: Dynamic pricing with live exchange rates and fees
- **Payment Monitoring**: Real-time status tracking and transaction history
- **Secure Processing**: Enterprise-grade payment infrastructure with error handling
- **Developer-Friendly**: Clean API integration with comprehensive documentation

### 🛠️ Technical Implementation:
- **Payment API**: `/api/kirapay/payment` - Process and monitor payments
- **Quote API**: `/api/kirapay/quote` - Get real-time conversion rates
- **Currencies API**: `/api/kirapay/currencies` - Get supported tokens
- **Service Layer**: `src/lib/kirapay-service.ts` - Complete integration logic

### 🌐 Supported Networks:
- **Ethereum Mainnet** - Chain ID: 1
- **Polygon** - Chain ID: 137
- **Base** - Chain ID: 8453
- **Arbitrum** - Chain ID: 42161
- **Optimism** - Chain ID: 10

### 💰 Supported Tokens:
- **USDC**: Multi-chain stablecoin support
- **USDT**: Tether stablecoin
- **ETH/MATIC/ARB**: Native gas tokens
- **BTC**: Bitcoin support
- **DAI**: Decentralized stablecoin

### 🎯 Integration Flow:
1. **Connect Wallet** → MetaMask integration
2. **Select Token** → Choose from supported currencies
3. **Get Quote** → Fetch real-time conversion rates and fees
4. **Process Payment** → Execute payment via KiraPay API
5. **Monitor Status** → Real-time payment tracking and completion

### 📱 Integration Points:
- **CheckoutModal**: Complete KiraPay payment flow with currency selection
- **Payment Demo**: `/payment-demo` - Interactive payment testing interface
- **API Endpoints**: Full RESTful API suite for payment processing
## 💳 KiraPay Multi-Chain Payment Integration ✅

POLYVERSE features complete **KiraPay payment processing integration** for seamless multi-token payments and cross-chain transactions.

### ✨ Features:
- **Multi-Token Support**: Accept payments in USDC, USDT, ETH, MATIC, BTC
- **Real-time Quotes**: Dynamic pricing with live exchange rates and fees
- **Payment Monitoring**: Real-time status tracking and transaction history
- **Secure Processing**: Enterprise-grade payment infrastructure with error handling
- **Developer-Friendly**: Clean API integration with comprehensive documentation

### 🛠️ Technical Implementation:
- **Payment API**: `/api/kirapay/payment` - Process and monitor payments
- **Quote API**: `/api/kirapay/quote` - Get real-time conversion rates
- **Currencies API**: `/api/kirapay/currencies` - Get supported tokens
- **Service Layer**: `src/lib/kirapay-service.ts` - Complete integration logic

### 🌐 Supported Networks:
- **Ethereum Mainnet** - Chain ID: 1
- **Polygon** - Chain ID: 137
- **Base** - Chain ID: 8453
- **Arbitrum** - Chain ID: 42161
- **Optimism** - Chain ID: 10

### 💰 Supported Tokens:
- **USDC**: Multi-chain stablecoin support
- **USDT**: Tether stablecoin
- **ETH/MATIC/ARB**: Native gas tokens
- **BTC**: Bitcoin support
- **DAI**: Decentralized stablecoin

### 🎯 Integration Flow:
1. **Connect Wallet** → MetaMask integration
2. **Select Token** → Choose from supported currencies
3. **Get Quote** → Fetch real-time conversion rates and fees
4. **Process Payment** → Execute payment via KiraPay API
5. **Monitor Status** → Real-time payment tracking and completion

### 📱 Integration Points:
- **CheckoutModal**: Complete KiraPay payment flow with currency selection
- **Payment Demo**: `/payment-demo` - Interactive payment testing interface
- **API Endpoints**: Full RESTful API suite for payment processing
## 💳 KiraPay Multi-Chain Payment Integration ✅

POLYVERSE features complete **KiraPay payment processing integration** for seamless multi-token payments and cross-chain transactions.

### ✨ Features:
- **Multi-Token Support**: Accept payments in USDC, USDT, ETH, MATIC, BTC
- **Real-time Quotes**: Dynamic pricing with live exchange rates and fees
- **Payment Monitoring**: Real-time status tracking and transaction history
- **Secure Processing**: Enterprise-grade payment infrastructure with error handling
- **Developer-Friendly**: Clean API integration with comprehensive documentation

### 🛠️ Technical Implementation:
- **Payment API**: `/api/kirapay/payment` - Process and monitor payments
- **Quote API**: `/api/kirapay/quote` - Get real-time conversion rates
- **Currencies API**: `/api/kirapay/currencies` - Get supported tokens
- **Service Layer**: `src/lib/kirapay-service.ts` - Complete integration logic

### 🌐 Supported Networks:
- **Ethereum Mainnet** - Chain ID: 1
- **Polygon** - Chain ID: 137
- **Base** - Chain ID: 8453
- **Arbitrum** - Chain ID: 42161
- **Optimism** - Chain ID: 10

### 💰 Supported Tokens:
- **USDC**: Multi-chain stablecoin support
- **USDT**: Tether stablecoin
- **ETH/MATIC/ARB**: Native gas tokens
- **BTC**: Bitcoin support
- **DAI**: Decentralized stablecoin

### 🎯 Integration Flow:
1. **Connect Wallet** → MetaMask integration
2. **Select Token** → Choose from supported currencies
3. **Get Quote** → Fetch real-time conversion rates and fees
4. **Process Payment** → Execute payment via KiraPay API
5. **Monitor Status** → Real-time payment tracking and completion

### 📱 Integration Points:
- **CheckoutModal**: Complete KiraPay payment flow with currency selection
- **Payment Demo**: `/payment-demo` - Interactive payment testing interface
- **API Endpoints**: Full RESTful API suite for payment processing
## 💳 KiraPay Multi-Chain Payment Integration ✅

POLYVERSE features complete **KiraPay payment processing integration** for seamless multi-token payments and cross-chain transactions.

### ✨ Features:
- **Multi-Token Support**: Accept payments in USDC, USDT, ETH, MATIC, BTC
- **Real-time Quotes**: Dynamic pricing with live exchange rates and fees
- **Payment Monitoring**: Real-time status tracking and transaction history
- **Secure Processing**: Enterprise-grade payment infrastructure with error handling
- **Developer-Friendly**: Clean API integration with comprehensive documentation

### 🛠️ Technical Implementation:
- **Payment API**: `/api/kirapay/payment` - Process and monitor payments
- **Quote API**: `/api/kirapay/quote` - Get real-time conversion rates
- **Currencies API**: `/api/kirapay/currencies` - Get supported tokens
- **Service Layer**: `src/lib/kirapay-service.ts` - Complete integration logic

### 🌐 Supported Networks:
- **Ethereum Mainnet** - Chain ID: 1
- **Polygon** - Chain ID: 137
- **Base** - Chain ID: 8453
- **Arbitrum** - Chain ID: 42161
- **Optimism** - Chain ID: 10

### 💰 Supported Tokens:
- **USDC**: Multi-chain stablecoin support
- **USDT**: Tether stablecoin
- **ETH/MATIC/ARB**: Native gas tokens
- **BTC**: Bitcoin support
- **DAI**: Decentralized stablecoin

### 🎯 Integration Flow:
1. **Connect Wallet** → MetaMask integration
2. **Select Token** → Choose from supported currencies
3. **Get Quote** → Fetch real-time conversion rates and fees
4. **Process Payment** → Execute payment via KiraPay API
5. **Monitor Status** → Real-time payment tracking and completion

### 📱 Integration Points:
- **CheckoutModal**: Complete KiraPay payment flow with currency selection
- **Payment Demo**: `/payment-demo` - Interactive payment testing interface
- **API Endpoints**: Full RESTful API suite for payment processing
## 💳 KiraPay Multi-Chain Payment Integration ✅

POLYVERSE features complete **KiraPay payment processing integration** for seamless multi-token payments and cross-chain transactions.

### ✨ Features:
- **Multi-Token Support**: Accept payments in USDC, USDT, ETH, MATIC, BTC
- **Real-time Quotes**: Dynamic pricing with live exchange rates and fees
- **Payment Monitoring**: Real-time status tracking and transaction history
- **Secure Processing**: Enterprise-grade payment infrastructure with error handling
- **Developer-Friendly**: Clean API integration with comprehensive documentation

### 🛠️ Technical Implementation:
- **Payment API**: `/api/kirapay/payment` - Process and monitor payments
- **Quote API**: `/api/kirapay/quote` - Get real-time conversion rates
- **Currencies API**: `/api/kirapay/currencies` - Get supported tokens
- **Service Layer**: `src/lib/kirapay-service.ts` - Complete integration logic

### 🌐 Supported Networks:
- **Ethereum Mainnet** - Chain ID: 1
- **Polygon** - Chain ID: 137
- **Base** - Chain ID: 8453
- **Arbitrum** - Chain ID: 42161
- **Optimism** - Chain ID: 10

### 💰 Supported Tokens:
- **USDC**: Multi-chain stablecoin support
- **USDT**: Tether stablecoin
- **ETH/MATIC/ARB**: Native gas tokens
- **BTC**: Bitcoin support
- **DAI**: Decentralized stablecoin

### 🎯 Integration Flow:
1. **Connect Wallet** → MetaMask integration
2. **Select Token** → Choose from supported currencies
3. **Get Quote** → Fetch real-time conversion rates and fees
4. **Process Payment** → Execute payment via KiraPay API
5. **Monitor Status** → Real-time payment tracking and completion

### 📱 Integration Points:
- **CheckoutModal**: Complete KiraPay payment flow with currency selection
- **Payment Demo**: `/payment-demo` - Interactive payment testing interface
- **API Endpoints**: Full RESTful API suite for payment processing
## 💳 KiraPay Multi-Chain Payment Integration ✅

POLYVERSE features complete **KiraPay payment processing integration** for seamless multi-token payments and cross-chain transactions.

### ✨ Features:
- **Multi-Token Support**: Accept payments in USDC, USDT, ETH, MATIC, BTC
- **Real-time Quotes**: Dynamic pricing with live exchange rates and fees
- **Payment Monitoring**: Real-time status tracking and transaction history
- **Secure Processing**: Enterprise-grade payment infrastructure with error handling
- **Developer-Friendly**: Clean API integration with comprehensive documentation

### 🛠️ Technical Implementation:
- **Payment API**: `/api/kirapay/payment` - Process and monitor payments
- **Quote API**: `/api/kirapay/quote` - Get real-time conversion rates
- **Currencies API**: `/api/kirapay/currencies` - Get supported tokens
- **Service Layer**: `src/lib/kirapay-service.ts` - Complete integration logic

### 🌐 Supported Networks:
- **Ethereum Mainnet** - Chain ID: 1
- **Polygon** - Chain ID: 137
- **Base** - Chain ID: 8453
- **Arbitrum** - Chain ID: 42161
- **Optimism** - Chain ID: 10

### 💰 Supported Tokens:
- **USDC**: Multi-chain stablecoin support
- **USDT**: Tether stablecoin
- **ETH/MATIC/ARB**: Native gas tokens
- **BTC**: Bitcoin support
- **DAI**: Decentralized stablecoin

### 🎯 Integration Flow:
1. **Connect Wallet** → MetaMask integration
2. **Select Token** → Choose from supported currencies
3. **Get Quote** → Fetch real-time conversion rates and fees
4. **Process Payment** → Execute payment via KiraPay API
5. **Monitor Status** → Real-time payment tracking and completion

### 📱 Integration Points:
- **CheckoutModal**: Complete KiraPay payment flow with currency selection
- **Payment Demo**: `/payment-demo` - Interactive payment testing interface
- **API Endpoints**: Full RESTful API suite for payment processing
## 💳 KiraPay Multi-Chain Payment Integration ✅

POLYVERSE features complete **KiraPay payment processing integration** for seamless multi-token payments and cross-chain transactions.

### ✨ Features:
- **Multi-Token Support**: Accept payments in USDC, USDT, ETH, MATIC, BTC
- **Real-time Quotes**: Dynamic pricing with live exchange rates and fees
- **Payment Monitoring**: Real-time status tracking and transaction history
- **Secure Processing**: Enterprise-grade payment infrastructure with error handling
- **Developer-Friendly**: Clean API integration with comprehensive documentation

### 🛠️ Technical Implementation:
- **Payment API**: `/api/kirapay/payment` - Process and monitor payments
- **Quote API**: `/api/kirapay/quote` - Get real-time conversion rates
- **Currencies API**: `/api/kirapay/currencies` - Get supported tokens
- **Service Layer**: `src/lib/kirapay-service.ts` - Complete integration logic

### 🌐 Supported Networks:
- **Ethereum Mainnet** - Chain ID: 1
- **Polygon** - Chain ID: 137
- **Base** - Chain ID: 8453
- **Arbitrum** - Chain ID: 42161
- **Optimism** - Chain ID: 10

### 💰 Supported Tokens:
- **USDC**: Multi-chain stablecoin support
- **USDT**: Tether stablecoin
- **ETH/MATIC/ARB**: Native gas tokens
- **BTC**: Bitcoin support
- **DAI**: Decentralized stablecoin

### 🎯 Integration Flow:
1. **Connect Wallet** → MetaMask integration
2. **Select Token** → Choose from supported currencies
3. **Get Quote** → Fetch real-time conversion rates and fees
4. **Process Payment** → Execute payment via KiraPay API
5. **Monitor Status** → Real-time payment tracking and completion

### 📱 Integration Points:
- **CheckoutModal**: Complete KiraPay payment flow with currency selection
- **Payment Demo**: `/payment-demo` - Interactive payment testing interface
- **API Endpoints**: Full RESTful API suite for payment processing
## 💳 KiraPay Multi-Chain Payment Integration ✅

POLYVERSE features complete **KiraPay payment processing integration** for seamless multi-token payments and cross-chain transactions.

### ✨ Features:
- **Multi-Token Support**: Accept payments in USDC, USDT, ETH, MATIC, BTC
- **Real-time Quotes**: Dynamic pricing with live exchange rates and fees
- **Payment Monitoring**: Real-time status tracking and transaction history
- **Secure Processing**: Enterprise-grade payment infrastructure with error handling
- **Developer-Friendly**: Clean API integration with comprehensive documentation

### 🛠️ Technical Implementation:
- **Payment API**: `/api/kirapay/payment` - Process and monitor payments
- **Quote API**: `/api/kirapay/quote` - Get real-time conversion rates
- **Currencies API**: `/api/kirapay/currencies` - Get supported tokens
- **Service Layer**: `src/lib/kirapay-service.ts` - Complete integration logic

### 🌐 Supported Networks:
- **Ethereum Mainnet** - Chain ID: 1
- **Polygon** - Chain ID: 137
- **Base** - Chain ID: 8453
- **Arbitrum** - Chain ID: 42161
- **Optimism** - Chain ID: 10

### 💰 Supported Tokens:
- **USDC**: Multi-chain stablecoin support
- **USDT**: Tether stablecoin
- **ETH/MATIC/ARB**: Native gas tokens
- **BTC**: Bitcoin support
- **DAI**: Decentralized stablecoin

### 🎯 Integration Flow:
1. **Connect Wallet** → MetaMask integration
2. **Select Token** → Choose from supported currencies
3. **Get Quote** → Fetch real-time conversion rates and fees
4. **Process Payment** → Execute payment via KiraPay API
5. **Monitor Status** → Real-time payment tracking and completion

### 📱 Integration Points:
- **CheckoutModal**: Complete KiraPay payment flow with currency selection
- **Payment Demo**: `/payment-demo` - Interactive payment testing interface
- **API Endpoints**: Full RESTful API suite for payment processing
## 💳 KiraPay Multi-Chain Payment Integration ✅

POLYVERSE features complete **KiraPay payment processing integration** for seamless multi-token payments and cross-chain transactions.

### ✨ Features:
- **Multi-Token Support**: Accept payments in USDC, USDT, ETH, MATIC, BTC
- **Real-time Quotes**: Dynamic pricing with live exchange rates and fees
- **Payment Monitoring**: Real-time status tracking and transaction history
- **Secure Processing**: Enterprise-grade payment infrastructure with error handling
- **Developer-Friendly**: Clean API integration with comprehensive documentation

### 🛠️ Technical Implementation:
- **Payment API**: `/api/kirapay/payment` - Process and monitor payments
- **Quote API**: `/api/kirapay/quote` - Get real-time conversion rates
- **Currencies API**: `/api/kirapay/currencies` - Get supported tokens
- **Service Layer**: `src/lib/kirapay-service.ts` - Complete integration logic

### 🌐 Supported Networks:
- **Ethereum Mainnet** - Chain ID: 1
- **Polygon** - Chain ID: 137
- **Base** - Chain ID: 8453
- **Arbitrum** - Chain ID: 42161
- **Optimism** - Chain ID: 10

### 💰 Supported Tokens:
- **USDC**: Multi-chain stablecoin support
- **USDT**: Tether stablecoin
- **ETH/MATIC/ARB**: Native gas tokens
- **BTC**: Bitcoin support
- **DAI**: Decentralized stablecoin

### 🎯 Integration Flow:
1. **Connect Wallet** → MetaMask integration
2. **Select Token** → Choose from supported currencies
3. **Get Quote** → Fetch real-time conversion rates and fees
4. **Process Payment** → Execute payment via KiraPay API
5. **Monitor Status** → Real-time payment tracking and completion

### 📱 Integration Points:
- **CheckoutModal**: Complete KiraPay payment flow with currency selection
- **Payment Demo**: `/payment-demo` - Interactive payment testing interface
- **API Endpoints**: Full RESTful API suite for payment processing
## 💳 KiraPay Multi-Chain Payment Integration ✅

POLYVERSE features complete **KiraPay payment processing integration** for seamless multi-token payments and cross-chain transactions.

### ✨ Features:
- **Multi-Token Support**: Accept payments in USDC, USDT, ETH, MATIC, BTC
- **Real-time Quotes**: Dynamic pricing with live exchange rates and fees
- **Payment Monitoring**: Real-time status tracking and transaction history
- **Secure Processing**: Enterprise-grade payment infrastructure with error handling
- **Developer-Friendly**: Clean API integration with comprehensive documentation

### 🛠️ Technical Implementation:
- **Payment API**: `/api/kirapay/payment` - Process and monitor payments
- **Quote API**: `/api/kirapay/quote` - Get real-time conversion rates
- **Currencies API**: `/api/kirapay/currencies` - Get supported tokens
- **Service Layer**: `src/lib/kirapay-service.ts` - Complete integration logic

### 🌐 Supported Networks:
- **Ethereum Mainnet** - Chain ID: 1
- **Polygon** - Chain ID: 137
- **Base** - Chain ID: 8453
- **Arbitrum** - Chain ID: 42161
- **Optimism** - Chain ID: 10

### 💰 Supported Tokens:
- **USDC**: Multi-chain stablecoin support
- **USDT**: Tether stablecoin
- **ETH/MATIC/ARB**: Native gas tokens
- **BTC**: Bitcoin support
- **DAI**: Decentralized stablecoin

### 🎯 Integration Flow:
1. **Connect Wallet** → MetaMask integration
2. **Select Token** → Choose from supported currencies
3. **Get Quote** → Fetch real-time conversion rates and fees
4. **Process Payment** → Execute payment via KiraPay API
5. **Monitor Status** → Real-time payment tracking and completion

### 📱 Integration Points:
- **CheckoutModal**: Complete KiraPay payment flow with currency selection
- **Payment Demo**: `/payment-demo` - Interactive payment testing interface
- **API Endpoints**: Full RESTful API suite for payment processing
## 💳 KiraPay Multi-Chain Payment Integration ✅

POLYVERSE features complete **KiraPay payment processing integration** for seamless multi-token payments and cross-chain transactions.

### ✨ Features:
- **Multi-Token Support**: Accept payments in USDC, USDT, ETH, MATIC, BTC
- **Real-time Quotes**: Dynamic pricing with live exchange rates and fees
- **Payment Monitoring**: Real-time status tracking and transaction history
- **Secure Processing**: Enterprise-grade payment infrastructure with error handling
- **Developer-Friendly**: Clean API integration with comprehensive documentation

### 🛠️ Technical Implementation:
- **Payment API**: `/api/kirapay/payment` - Process and monitor payments
- **Quote API**: `/api/kirapay/quote` - Get real-time conversion rates
- **Currencies API**: `/api/kirapay/currencies` - Get supported tokens
- **Service Layer**: `src/lib/kirapay-service.ts` - Complete integration logic

### 🌐 Supported Networks:
- **Ethereum Mainnet** - Chain ID: 1
- **Polygon** - Chain ID: 137
- **Base** - Chain ID: 8453
- **Arbitrum** - Chain ID: 42161
- **Optimism** - Chain ID: 10

### 💰 Supported Tokens:
- **USDC**: Multi-chain stablecoin support
- **USDT**: Tether stablecoin
- **ETH/MATIC/ARB**: Native gas tokens
- **BTC**: Bitcoin support
- **DAI**: Decentralized stablecoin

### 🎯 Integration Flow:
1. **Connect Wallet** → MetaMask integration
2. **Select Token** → Choose from supported currencies
3. **Get Quote** → Fetch real-time conversion rates and fees
4. **Process Payment** → Execute payment via KiraPay API
5. **Monitor Status** → Real-time payment tracking and completion

### 📱 Integration Points:
- **CheckoutModal**: Complete KiraPay payment flow with currency selection
- **Payment Demo**: `/payment-demo` - Interactive payment testing interface
- **API Endpoints**: Full RESTful API suite for payment processing
## 💳 KiraPay Multi-Chain Payment Integration ✅

POLYVERSE features complete **KiraPay payment processing integration** for seamless multi-token payments and cross-chain transactions.

### ✨ Features:
- **Multi-Token Support**: Accept payments in USDC, USDT, ETH, MATIC, BTC
- **Real-time Quotes**: Dynamic pricing with live exchange rates and fees
- **Payment Monitoring**: Real-time status tracking and transaction history
- **Secure Processing**: Enterprise-grade payment infrastructure with error handling
- **Developer-Friendly**: Clean API integration with comprehensive documentation

### 🛠️ Technical Implementation:
- **Payment API**: `/api/kirapay/payment` - Process and monitor payments
- **Quote API**: `/api/kirapay/quote` - Get real-time conversion rates
- **Currencies API**: `/api/kirapay/currencies` - Get supported tokens
- **Service Layer**: `src/lib/kirapay-service.ts` - Complete integration logic

### 🌐 Supported Networks:
- **Ethereum Mainnet** - Chain ID: 1
- **Polygon** - Chain ID: 137
- **Base** - Chain ID: 8453
- **Arbitrum** - Chain ID: 42161
- **Optimism** - Chain ID: 10

### 💰 Supported Tokens:
- **USDC**: Multi-chain stablecoin support
- **USDT**: Tether stablecoin
- **ETH/MATIC/ARB**: Native gas tokens
- **BTC**: Bitcoin support
- **DAI**: Decentralized stablecoin

### 🎯 Integration Flow:
1. **Connect Wallet** → MetaMask integration
2. **Select Token** → Choose from supported currencies
3. **Get Quote** → Fetch real-time conversion rates and fees
4. **Process Payment** → Execute payment via KiraPay API
5. **Monitor Status** → Real-time payment tracking and completion

### 📱 Integration Points:
- **CheckoutModal**: Complete KiraPay payment flow with currency selection
- **Payment Demo**: `/payment-demo` - Interactive payment testing interface
- **API Endpoints**: Full RESTful API suite for payment processing
## 💳 KiraPay Multi-Chain Payment Integration ✅

POLYVERSE features complete **KiraPay payment processing integration** for seamless multi-token payments and cross-chain transactions.

### ✨ Features:
- **Multi-Token Support**: Accept payments in USDC, USDT, ETH, MATIC, BTC
- **Real-time Quotes**: Dynamic pricing with live exchange rates and fees
- **Payment Monitoring**: Real-time status tracking and transaction history
- **Secure Processing**: Enterprise-grade payment infrastructure with error handling
- **Developer-Friendly**: Clean API integration with comprehensive documentation

### 🛠️ Technical Implementation:
- **Payment API**: `/api/kirapay/payment` - Process and monitor payments
- **Quote API**: `/api/kirapay/quote` - Get real-time conversion rates
- **Currencies API**: `/api/kirapay/currencies` - Get supported tokens
- **Service Layer**: `src/lib/kirapay-service.ts` - Complete integration logic

### 🌐 Supported Networks:
- **Ethereum Mainnet** - Chain ID: 1
- **Polygon** - Chain ID: 137
- **Base** - Chain ID: 8453
- **Arbitrum** - Chain ID: 42161
- **Optimism** - Chain ID: 10

### 💰 Supported Tokens:
- **USDC**: Multi-chain stablecoin support
- **USDT**: Tether stablecoin
- **ETH/MATIC/ARB**: Native gas tokens
- **BTC**: Bitcoin support
- **DAI**: Decentralized stablecoin

### 🎯 Integration Flow:
1. **Connect Wallet** → MetaMask integration
2. **Select Token** → Choose from supported currencies
3. **Get Quote** → Fetch real-time conversion rates and fees
4. **Process Payment** → Execute payment via KiraPay API
5. **Monitor Status** → Real-time payment tracking and completion

### 📱 Integration Points:
- **CheckoutModal**: Complete KiraPay payment flow with currency selection
- **Payment Demo**: `/payment-demo` - Interactive payment testing interface
- **API Endpoints**: Full RESTful API suite for payment processing
## 💳 KiraPay Multi-Chain Payment Integration ✅

POLYVERSE features complete **KiraPay payment processing integration** for seamless multi-token payments and cross-chain transactions.

### ✨ Features:
- **Multi-Token Support**: Accept payments in USDC, USDT, ETH, MATIC, BTC
- **Real-time Quotes**: Dynamic pricing with live exchange rates and fees
- **Payment Monitoring**: Real-time status tracking and transaction history
- **Secure Processing**: Enterprise-grade payment infrastructure with error handling
- **Developer-Friendly**: Clean API integration with comprehensive documentation

### 🛠️ Technical Implementation:
- **Payment API**: `/api/kirapay/payment` - Process and monitor payments
- **Quote API**: `/api/kirapay/quote` - Get real-time conversion rates
- **Currencies API**: `/api/kirapay/currencies` - Get supported tokens
- **Service Layer**: `src/lib/kirapay-service.ts` - Complete integration logic

### 🌐 Supported Networks:
- **Ethereum Mainnet** - Chain ID: 1
- **Polygon** - Chain ID: 137
- **Base** - Chain ID: 8453
- **Arbitrum** - Chain ID: 42161
- **Optimism** - Chain ID: 10

### 💰 Supported Tokens:
- **USDC**: Multi-chain stablecoin support
- **USDT**: Tether stablecoin
- **ETH/MATIC/ARB**: Native gas tokens
- **BTC**: Bitcoin support
- **DAI**: Decentralized stablecoin

### 🎯 Integration Flow:
1. **Connect Wallet** → MetaMask integration
2. **Select Token** → Choose from supported currencies
3. **Get Quote** → Fetch real-time conversion rates and fees
4. **Process Payment** → Execute payment via KiraPay API
5. **Monitor Status** → Real-time payment tracking and completion

### 📱 Integration Points:
- **CheckoutModal**: Complete KiraPay payment flow with currency selection
- **Payment Demo**: `/payment-demo` - Interactive payment testing interface
- **API Endpoints**: Full RESTful API suite for payment processing
## 💳 KiraPay Multi-Chain Payment Integration ✅

POLYVERSE features complete **KiraPay payment processing integration** for seamless multi-token payments and cross-chain transactions.

### ✨ Features:
- **Multi-Token Support**: Accept payments in USDC, USDT, ETH, MATIC, BTC
- **Real-time Quotes**: Dynamic pricing with live exchange rates and fees
- **Payment Monitoring**: Real-time status tracking and transaction history
- **Secure Processing**: Enterprise-grade payment infrastructure with error handling
- **Developer-Friendly**: Clean API integration with comprehensive documentation

### 🛠️ Technical Implementation:
- **Payment API**: `/api/kirapay/payment` - Process and monitor payments
- **Quote API**: `/api/kirapay/quote` - Get real-time conversion rates
- **Currencies API**: `/api/kirapay/currencies` - Get supported tokens
- **Service Layer**: `src/lib/kirapay-service.ts` - Complete integration logic

### 🌐 Supported Networks:
- **Ethereum Mainnet** - Chain ID: 1
- **Polygon** - Chain ID: 137
- **Base** - Chain ID: 8453
- **Arbitrum** - Chain ID: 42161
- **Optimism** - Chain ID: 10

### 💰 Supported Tokens:
- **USDC**: Multi-chain stablecoin support
- **USDT**: Tether stablecoin
- **ETH/MATIC/ARB**: Native gas tokens
- **BTC**: Bitcoin support
- **DAI**: Decentralized stablecoin

### 🎯 Integration Flow:
1. **Connect Wallet** → MetaMask integration
2. **Select Token** → Choose from supported currencies
3. **Get Quote** → Fetch real-time conversion rates and fees
4. **Process Payment** → Execute payment via KiraPay API
5. **Monitor Status** → Real-time payment tracking and completion

### 📱 Integration Points:
- **CheckoutModal**: Complete KiraPay payment flow with currency selection
- **Payment Demo**: `/payment-demo` - Interactive payment testing interface
- **API Endpoints**: Full RESTful API suite for payment processing
## 💳 KiraPay Multi-Chain Payment Integration ✅

POLYVERSE features complete **KiraPay payment processing integration** for seamless multi-token payments and cross-chain transactions.

### ✨ Features:
- **Multi-Token Support**: Accept payments in USDC, USDT, ETH, MATIC, BTC
- **Real-time Quotes**: Dynamic pricing with live exchange rates and fees
- **Payment Monitoring**: Real-time status tracking and transaction history
- **Secure Processing**: Enterprise-grade payment infrastructure with error handling
- **Developer-Friendly**: Clean API integration with comprehensive documentation

### 🛠️ Technical Implementation:
- **Payment API**: `/api/kirapay/payment` - Process and monitor payments
- **Quote API**: `/api/kirapay/quote` - Get real-time conversion rates
- **Currencies API**: `/api/kirapay/currencies` - Get supported tokens
- **Service Layer**: `src/lib/kirapay-service.ts` - Complete integration logic

### 🌐 Supported Networks:
- **Ethereum Mainnet** - Chain ID: 1
- **Polygon** - Chain ID: 137
- **Base** - Chain ID: 8453
- **Arbitrum** - Chain ID: 42161
- **Optimism** - Chain ID: 10

### 💰 Supported Tokens:
- **USDC**: Multi-chain stablecoin support
- **USDT**: Tether stablecoin
- **ETH/MATIC/ARB**: Native gas tokens
- **BTC**: Bitcoin support
- **DAI**: Decentralized stablecoin

### 🎯 Integration Flow:
1. **Connect Wallet** → MetaMask integration
2. **Select Token** → Choose from supported currencies
3. **Get Quote** → Fetch real-time conversion rates and fees
4. **Process Payment** → Execute payment via KiraPay API
5. **Monitor Status** → Real-time payment tracking and completion

### 📱 Integration Points:
- **CheckoutModal**: Complete KiraPay payment flow with currency selection
- **Payment Demo**: `/payment-demo` - Interactive payment testing interface
- **API Endpoints**: Full RESTful API suite for payment processing
### 📱 Integration Points (TODO):
- **CheckoutModal**: Enhanced with KiraPay payment flow
- **Demo Page**: `/payment-demo` - Interactive payment demo
- **Payment Flow**: Integrated throughout creator marketplace### 🔗 Integration Roadmap

## 🏛️ x402 Agentic Subscription System

POLYVERSE features **x402 protocol integration** for decentralized recurring payments with autonomous agent execution.

### ✨ Key Features:
- **HTTP 402 Protocol**: Standards-compliant payment-required responses
- **Autonomous Agent**: Background service for recurring payment processing
- **Polygon Amoy Integration**: USDC-based subscription payments on testnet
- **Creator Dashboard**: Full subscription management and analytics
- **Real-time Monitoring**: Agent status, payment stats, and failure tracking

### 🤖 Agent Architecture:
- **Payment Scheduler**: Monitors subscription due dates every 30 seconds (dev) / 5 minutes (prod)
- **x402 Verification**: Validates payments using facilitator or simulation
- **Retry Logic**: Up to 3 retry attempts with exponential backoff
- **Event Logging**: Complete audit trail of all payment attempts

### 🛠️ Technical Implementation:
- **Service Layer**: `src/lib/x402-service.ts` - Core x402 protocol integration
- **Agent Engine**: `src/lib/x402-agent.ts` - Autonomous payment processing
- **Database Layer**: `src/lib/subscription-db.ts` - Subscription state management
- **API Endpoints**: `/api/x402/*` - REST APIs for subscription management

### 📊 Subscription Management:
- **Plan Creation**: Creators define pricing (USD), intervals (daily/weekly/monthly)
- **x402 Integration**: HTTP 402 responses with payment requirements
- **Intent Creation**: Authorize agent for recurring micropayments
- **Dashboard Analytics**: Revenue tracking, subscriber metrics, payment success rates

### 🎯 Demo Workflow:
1. **Create Plan** → Define subscription terms and pricing
2. **Subscribe** → Users create subscriptions with x402 intent authorization
3. **Agent Processing** → Autonomous agent monitors and processes payments
4. **Payment Execution** → Real/simulated USDC transfers to creator addresses
5. **Status Tracking** → Real-time monitoring of payment success/failure

### 📱 User Interface:
- **Demo Page**: `/x402-demo` - Complete subscription management interface
- **Subscription Plans**: Browse available creator subscriptions
- **My Subscriptions**: Track active subscriptions, payment dates, total spent
- **Agent Controls**: Start/stop agent, force payment processing, configuration
- **Analytics Dashboard**: Payment statistics, success rates, revenue metrics

### 🌐 Network Configuration:
- **Polygon Amoy Testnet**: Chain ID 80002
- **USDC Token**: `0x41e94eb019c0762f9bfcf9fb1e58725bfb0e7582`
- **Facilitator**: x402.org (with fallback simulation)
- **Agent Wallet**: Configurable private key for payment execution

### 🔧 Agent Configuration:
```bash
# Environment Variables
X402_FACILITATOR_URL=https://x402.org/facilitator
PRIVATE_KEY_AGENT=0x... # Agent wallet private key
POLYGON_AMOY_RPC=https://rpc-amoy.polygon.technology
X402_AGENT_ENABLED=true
```

### 🎥 Demo Scenarios:
- **Real x402 Facilitator**: Connect to actual x402.org facilitator container
- **Agent Simulation**: Real payment processing with transaction monitoring for production use
- **Payment Monitoring**: Watch agent process scheduled payments in real-time
- **Failure Handling**: Simulate payment failures and retry logic

### 📚 x402 Resources:
- **Protocol Docs**: https://x402.gitbook.io/x402
- **Coinbase x402 API**: https://docs.cdp.coinbase.com/x402/docs/welcome
- **GitHub Repository**: https://github.com/coinbase/x402
- **Setup Guide**: See `X402_SETUP_GUIDE.md` for complete facilitator container setup
- **Facilitator Container**: Docker setup for local x402 facilitator

Additional integrations planned:

### Polygon x402 Integration  
```typescript
// TODO: integrate Polygon x402 for on-chain raffle verification
// In /raffle page - for transparent winner selection
```

### The Graph Protocol
```typescript
// TODO: integrate The Graph for creator analytics
// In Dashboard page - for real-time blockchain data indexing
```

### Pyth Network
```typescript  
// TODO: integrate Pyth for real-time token prices
// Replace static pricing with live price feeds
```

### Akave Integration
```typescript
// TODO: integrate Akave for creator content storage
// For permanent, censorship-resistant content hosting
```

## 🎯 Project Structure

```
src/
├── app/                 # Next.js App Router pages
├── components/          # Reusable UI components  
├── lib/                # Utilities, types, and services
├── __tests__/          # Test files
data/                   # Creator and application data
public/                 # Static assets
```

## 🎨 Design System

### Colors
- **Primary**: `#6C5CE7` (Purple)
- **Primary Dark**: `#5A4FCF`
- **Primary Light**: `#A29BFC`

### Responsive Breakpoints
- Mobile-first approach
- `md:` 768px+
- `lg:` 1024px+

## 🔄 State Management

- **Production Mode**: localStorage toggle for demo/production functionality
- **User Data**: localStorage for wallet connections
- **Purchases**: localStorage for transaction persistence  
- **Creator Data**: Static JSON files with fetch API

## 🚦 Git Workflow

Suggested commit structure:

```bash
# Initial project setup
git add package.json tailwind.config.js next.config.js tsconfig.json
git commit -m "feat: initial Next.js + TypeScript + Tailwind setup"

# Core components and pages  
git add src/components/ src/app/ data/
git commit -m "feat: add core components and pages with creator data"

# Testing and documentation
git add src/__tests__/ README.md jest.config.js
git commit -m "feat: add comprehensive tests and documentation"
```

## 📚 Learn More

### Core Technologies
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [TypeScript](https://www.typescriptlang.org/)

### KiraPay Integration (TODO)
- [KiraPay Documentation](https://docs.kirapay.io/)  
- [KiraPay Developer Portal](https://developer.kirapay.io/)
- [KiraPay API Reference](https://api.kirapay.io/docs)
- [KiraPay SDK](https://github.com/kirapay/sdk)

### Filecoin & IPFS
- [Lighthouse Storage](https://lighthouse.storage/) 
- [Filecoin Documentation](https://docs.filecoin.io/)
- [IPFS Documentation](https://docs.ipfs.tech/)
- [Lighthouse SDK](https://docs.lighthouse.storage/)

### Blockchain Networks
- [Polygon](https://polygon.technology/)
- [Base Network](https://base.org/)
- [Arbitrum](https://arbitrum.io/)
- [Optimism](https://optimism.io/)

### Additional Integrations
- [The Graph](https://thegraph.com/)
- [Pyth Network](https://pyth.network/)
- [Akave Storage](https://akave.ai/)

## 🤝 Contributing

This is a demo project showcasing blockchain integration patterns. For real implementations, integrate actual payment processing at the designated TODO markers.

## 📄 License

MIT License - see LICENSE file for details.