# POLYVERSE — Decentralized Creator Economy Platform 🚀

A Web3 creator platform that enables subscription-based content monetization through **x402 protocol payments**, **Filecoin decentralized storage**, and **multi-chain processing**.

## ✨ Key Features

🔐 **x402 Protocol Subscriptions** - HTTP 402 paywall with real USDC payments on Polygon  
🌐 **Filecoin Storage** - Decentralized, encrypted content hosting via Lighthouse  
💳 **Multi-chain Payments** - Crypto payment processing across networks  
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
# Configure your API keys in .env.local
```

**Required Environment Variables:**
```bash
# x402 Protocol
NEXT_PUBLIC_X402_FACILITATOR_URL=https://x402.polygon.technology
NEXT_PUBLIC_RECIPIENT_ADDRESS=0x90D9CD66FAdFF1C2Ba32C99A47C76532d08A704B

# Polygon Network  
NEXT_PUBLIC_AMOY_RPC=https://rpc-amoy.polygon.technology

# Filecoin Lighthouse Storage
LIGHTHOUSE_API_KEY=your_lighthouse_api_key_here
LIGHTHOUSE_GATEWAY_URL=https://gateway.lighthouse.storage/ipfs/

# Payment Processing
KIRAPAY_API_KEY=your_kirapay_api_key
```

### 3. Get API Keys
- **Lighthouse API**: [lighthouse.storage](https://lighthouse.storage) for Filecoin storage
- **KiraPay API**: [kirapay.com](https://kirapay.com) for payment processing  

### 4. Start Development
```bash
npm run dev
# Open http://localhost:3000
```

## 🛠️ Technology Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Blockchain**: Polygon, x402 Protocol, EIP-3009 signatures
- **Storage**: Filecoin network via Lighthouse SDK
- **Payments**: Multi-chain crypto processing
- **Wallet**: RainbowKit, Wagmi, viem

## 🎯 How It Works

### For Creators
1. **Upload Content** → Files stored on Filecoin via Lighthouse
2. **Set Subscriptions** → Configure pricing and access tiers
3. **Receive Payments** → USDC payments via x402 protocol
4. **Track Analytics** → Monitor subscribers and earnings

### For Subscribers  
1. **Connect Wallet** → Support for major Web3 wallets
2. **Choose Plan** → Select subscription tier
3. **Pay with Crypto** → Real blockchain transactions
4. **Access Content** → Token-gated premium content

## 📚 API Reference

### x402 Subscription Purchase
```bash
# Initial request returns HTTP 402 with payment details
curl -X POST http://localhost:3000/api/subscriptions/purchase \
  -H "Content-Type: application/json" \
  -d '{"planId":"basic-weekly"}'

# With payment authorization
curl -X POST http://localhost:3000/api/subscriptions/purchase \
  -H "X-PAYMENT: eyJzY2hlbWUiOiJleGFjdC..." \
  -d '{"planId":"basic-weekly"}'
```

### Filecoin Storage Upload
```bash
curl -X POST http://localhost:3000/api/storage/upload \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -F "file=@content.pdf" \
  -F "encrypt=true"
```

### Payment Creation
```bash
curl -X POST http://localhost:3000/api/payments/create \
  -H "Content-Type: application/json" \
  -d '{
    "amount": "5.00",
    "currency": "USDC",
    "network": "polygon",
    "subscriptionPlan": "basic-weekly"
  }'
```

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js 14 App Router
│   ├── api/               # API routes
│   │   ├── subscriptions/ # x402 subscription endpoints  
│   │   ├── storage/       # Filecoin Lighthouse APIs
│   │   └── payments/      # Payment integration
│   ├── components/        # React components
│   │   ├── demo/         # Demo components
│   │   └── ui/           # UI components
│   └── hypergraph/       # Data service layer
├── data/                  # Sample data
└── docs/                  # Documentation
```

## 🧪 Testing

### Network Configuration
**Polygon Amoy Testnet:**
- **RPC URL**: https://rpc-amoy.polygon.technology  
- **Chain ID**: 80002
- **Currency**: POL
- **Explorer**: https://amoy.polygonscan.com

### Get Test Tokens
- **POL**: [Polygon Faucet](https://faucet.polygon.technology)
- **Test USDC**: Contract `0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582`

## 🔧 x402 Protocol Integration

### Features
- **HTTP 402 Payment Required** - Standards-compliant payment responses
- **Autonomous Agent** - Background service for recurring payments
- **Real USDC Transactions** - Polygon Amoy testnet integration
- **Subscription Management** - Creator dashboard with analytics

### Demo Workflow
1. **Create Subscription** → Define pricing and intervals
2. **x402 Authorization** → HTTP 402 response with payment requirements  
3. **Agent Processing** → Autonomous payment execution
4. **Real-time Monitoring** → Track payment success/failure

### Environment Setup
```bash
# x402 Agent Configuration
X402_FACILITATOR_URL=https://x402.org/facilitator
PRIVATE_KEY_AGENT=0x... # Agent wallet private key
X402_AGENT_ENABLED=true
```

## 💾 Filecoin Storage Demo

### Features
- **Decentralized Storage** - Files stored on Filecoin network
- **Lighthouse Integration** - Easy IPFS uploads with encryption
- **Token-Gated Access** - Secure content distribution
- **Deal Monitoring** - Track Filecoin storage deals

### Usage
```bash
# Upload encrypted file
curl -X POST /api/storage/upload \
  -F "file=@document.pdf" \
  -F "encrypt=true"

# Check storage deals
curl /api/storage/deals?hash=QmXXX...
```

## 🚀 Deployment

### Build for Production
```bash
npm run build
npm start
```

### Deploy to Vercel
```bash
vercel deploy
```

### Environment Variables
Set all required environment variables in your deployment platform.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🏆 Roadmap

- [x] x402 Protocol Integration with Polygon
- [x] Filecoin Lighthouse Storage
- [x] Multi-chain Payment Processing
- [x] Creator Showcase with Sample Data
- [ ] NFT Access Token Minting
- [ ] Cross-Chain Subscription Bridging
- [ ] Mobile App Development
- [ ] DAO Governance Implementation

## 📚 Documentation

For comprehensive technical documentation, see the `/docs` folder:

- **[x402 Protocol Guide](./docs/x402-protocol.md)** - HTTP 402 implementation
- **[Filecoin Storage Guide](./docs/filecoin-lighthouse.md)** - Decentralized storage
- **[API Reference](./docs/api-reference.md)** - Complete API documentation
- **[Deployment Guide](./docs/deployment.md)** - Production deployment

## 📞 Support

- **Documentation**: [./docs](./docs/)
- **GitHub Issues**: [Report bugs](https://github.com/sambitsargam/POLYVERSE/issues)
- **Discord**: [Join community](https://discord.gg/polyverse)
- **Email**: support@polyverse.com

## 🛡️ Security

- All payments use real blockchain transactions
- Content encryption via Lighthouse SDK
- No private keys stored in frontend
- x402 protocol for secure subscription management

## 📊 Features Demo

### Creator Showcase
- Interactive creator profiles with realistic data
- Subscription tiers and product displays
- Community activity and follower statistics
- Professional UI with gradient designs

### Demo Pages
- **`/`** - Main creator showcase
- **`/demo/hypergraph`** - Interactive data demo
- **`/x402-demo`** - Subscription management (when implemented)
- **`/filecoin-demo`** - Storage demo (when implemented)

## 📄 License

MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ for the decentralized creator economy**

*Empowering creators through Web3 technology and sustainable blockchain monetization.*
