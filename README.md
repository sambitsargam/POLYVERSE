# POLYVERSE — Creator Storefront

A decentralized creator economy platform built with Next.js, TypeScript, and Tailwind CSS. This is a mock-only MVP that demonstrates blockchain-integrated creator storefronts without requiring real blockchain connections.

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
- **FileUploader**: Drag-and-drop file upload simulation

## 💰 Mock Payment System

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