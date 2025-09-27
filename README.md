# POLYVERSE — Creator Storefront 🚀

A decentralized creator economy platform built with Next.js, TypeScript, and Tailwind CSS, featuring **Filecoin storage integration** for secure, decentralized digital goods.

## ✨ Features

- **Creator Marketplace**: Discover and support creators with tiered subscriptions
- **Dashboard Analytics**: Real-time earnings, subscriber metrics, and growth insights  
- **Token-Gated Content**: Secure digital goods with blockchain-based access control
- **Filecoin Integration**: Decentralized storage via Lighthouse SDK with encryption support
- **1inch Integration**: Seamless crypto payments with optimal swap rates
- **Raffle System**: Engage communities with token-based raffles
- **Responsive Design**: Mobile-first approach with modern UI/UX

## 🗄️ Filecoin Storage Integration

POLYVERSE integrates with Filecoin's decentralized storage network to provide secure, censorship-resistant storage for creator content.

### Key Features:
- **Lighthouse SDK Integration**: Upload files directly to Filecoin with deal tracking
- **Automatic Encryption**: Client-side encryption for premium content
- **Token Gating**: ERC-721 NFT-based access control
- **Deal Monitoring**: Real-time Filecoin deal status and PoDSI proofs
- **IPFS Gateway**: Fast content delivery via IPFS network

### Demo Features:
- 📤 **Upload Flow**: Drag & drop files to Filecoin storage
- 🔐 **Access Control**: Mint access tokens after payment
- 📊 **Deal Tracking**: Monitor storage deals and network status
- 💰 **Payment Integration**: Simulate 1inch payments for gated content

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
# Lighthouse API Configuration
LIGHTHOUSE_API_KEY=your_lighthouse_api_key_here
LIGHTHOUSE_GATEWAY_URL=https://gateway.lighthouse.storage/ipfs/

# Filecoin Network
FILECOIN_RPC=https://api.calibration.node.glif.io/rpc/v1
NETWORK=calibration

# Storage Configuration
NEXT_PUBLIC_GATEWAY_URL=https://gateway.lighthouse.storage/ipfs/
```

### 3. Get Lighthouse API Key
1. Visit [files.lighthouse.storage](https://files.lighthouse.storage/)
2. Create an account and generate an API key
3. Add the key to your `.env.local` file

### 4. Setup MetaMask Wallet
1. Install MetaMask browser extension
2. Add Filecoin Calibration testnet:
   - Network name: Filecoin Calibration
   - RPC URL: https://api.calibration.node.glif.io/rpc/v1
   - Chain ID: 314159
   - Currency: tFIL
3. Get testnet FIL from [calibration faucet](https://faucet.calibration.fildev.network/)

### 4. Run Development Server
```bash
npm run dev
# Open http://localhost:3000
```

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
- **Raffle (`/raffle`)**: Community raffle system with mock winner selection
- **Connect Wallet (`/connect`)**: Mock wallet connection flow

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

## �💰 Mock Payment System

### How to Simulate Purchases

1. **Enable Mock Mode**: Toggle the "Mock Mode" switch in the navbar (enabled by default)

2. **Connect a Wallet**: 
   - Go to `/connect`
   - Choose from 3 mock wallet addresses
   - Each has different balances (ETH, MATIC, USDC)

3. **Make Purchases**:
   - Subscribe to creator tiers
   - Buy digital products  
   - Send tips to creators
   - Join raffles (free)

4. **Payment Flow**:
   - Select token (USDC, MATIC, ETH)
   - View calculated token amounts using mock exchange rates
   - Click "Pay (Simulate)" 
   - 2-second loading simulation
   - Success toast + localStorage persistence

5. **View Results**:
   - Check Dashboard for MRR and earnings
   - See transaction history
   - View subscriber counts

## 📊 Mock Data Structure

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
```

### Exchange Rates (`/data/mockRates.json`)
```json
{
  "USD_TO_MATIC": 0.65,
  "USD_TO_ETH": 0.0004, 
  "USD_TO_USDC": 1.0
}
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode  
npm run test:watch
```

**Test Coverage:**
- `CreatorCard.test.tsx`: Component rendering and interaction
- `CheckoutModal.test.tsx`: Payment flow and token calculations  
- `utils.test.ts`: MRR calculation, subscriber counting, earnings totals

## 🔗 Integration Roadmap

The codebase includes TODO comments showing where real blockchain integrations will be added:

### 1inch Fusion+ Integration
```typescript
// TODO: integrate 1inch Fusion+ here
// In CheckoutModal.tsx - replace MockDataStore.simulatePayment()
```

### Polygon x402 Integration  
```typescript
// TODO: integrate Polygon x402 for on-chain raffle verification
// In /raffle page - for transparent winner selection
```

### Filecoin/IPFS Storage
```typescript
// TODO: integrate Filecoin/IPFS storage here  
// In FileUploader.tsx - for decentralized content storage
```

### The Graph Protocol
```typescript
// TODO: integrate The Graph for creator analytics
// In Dashboard page - for real-time blockchain data indexing
```

### Pyth Network
```typescript  
// TODO: integrate Pyth for real-time token prices
// Replace mockRates.json with live price feeds
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
├── lib/                # Utilities, types, mock data
├── __tests__/          # Test files
data/                   # Mock JSON data
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

- **Mock Mode**: localStorage toggle for demo/reset functionality
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
git commit -m "feat: add core components and pages with mock data"

# Testing and documentation
git add src/__tests__/ README.md jest.config.js
git commit -m "feat: add comprehensive tests and documentation"
```

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [TypeScript](https://www.typescriptlang.org/)
- [1inch Fusion+](https://1inch.io/fusion/)
- [Polygon](https://polygon.technology/)
- [The Graph](https://thegraph.com/)

## 🤝 Contributing

This is a demo project showcasing blockchain integration patterns. For real implementations, replace mock data with actual blockchain SDK calls at the designated TODO markers.

## 📄 License

MIT License - see LICENSE file for details.