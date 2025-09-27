# x402 Facilitator Container Setup Guide

This guide explains how to run the x402 facilitator container locally for testing the POLYVERSE x402 agentic subscription system.

## Prerequisites

- Docker installed and running
- Node.js v20+ and pnpm for x402 repository
- MetaMask with Polygon Amoy testnet configured
- Test USDC tokens on Polygon Amoy

## Option 1: Quick Setup (Simulation Mode)

The POLYVERSE demo works without a real facilitator by simulating x402 payments:

1. **Start POLYVERSE**:
   ```bash
   cd /Users/sambit/Downloads/POLYVERSE
   npm run dev
   ```

2. **Access x402 Demo**: Visit http://localhost:3000/x402-demo

3. **Demo Features**:
   - Create subscription plans
   - Subscribe to plans (simulation)
   - Watch autonomous agent process payments
   - Monitor payment statistics

## Option 2: Real x402 Facilitator Setup

For a complete x402 experience with real HTTP 402 responses:

### Step 1: Clone x402 Repository

```bash
git clone https://github.com/coinbase/x402.git
cd x402
```

### Step 2: Setup Environment

```bash
# Copy example environment
cp .env.example .env

# Edit .env with your configuration:
# EVM_PRIVATE_KEY=0x... # Your agent wallet private key
# POLYGON_AMOY_RPC=https://rpc-amoy.polygon.technology
# FACILITATOR_URL=http://localhost:3001
```

### Step 3: Run Facilitator Container

```bash
# Build and run facilitator
cd examples/typescript/facilitator
pnpm install
pnpm run dev
```

The facilitator will start on http://localhost:3001 with these endpoints:
- `GET /supported` - List supported payment types
- `POST /verify` - Verify x402 payment payloads  
- `POST /settle` - Settle payments on blockchain

### Step 4: Update POLYVERSE Configuration

Update your POLYVERSE `.env` file:

```bash
X402_FACILITATOR_URL=http://localhost:3001
PRIVATE_KEY_AGENT=0x... # Same as facilitator EVM_PRIVATE_KEY
POLYGON_AMOY_RPC=https://rpc-amoy.polygon.technology
X402_AGENT_ENABLED=true
```

### Step 5: Test Integration

1. **Start POLYVERSE**:
   ```bash
   npm run dev
   ```

2. **Check Facilitator Connection**:
   - Visit http://localhost:3000/x402-demo
   - Look for "Facilitator: Available" status
   - Agent should show "Running" status

3. **Create & Test Subscription**:
   - Create a subscription plan
   - Subscribe to the plan
   - Watch real x402 HTTP 402 flow in action

## x402 Payment Flow

The complete x402 flow works as follows:

1. **Client Request**: User attempts to access subscription content
2. **402 Response**: Server returns HTTP 402 with payment requirements
3. **Payment Creation**: Client creates x402 payment payload
4. **Verification**: Facilitator verifies payment signature and funds
5. **Settlement**: Facilitator submits transaction to blockchain
6. **Content Access**: Server provides content after successful payment

## Testing with curl

You can test the facilitator directly:

```bash
# Check supported payment types
curl http://localhost:3001/supported

# Test payment verification (requires valid payload)
curl -X POST http://localhost:3001/verify \
  -H "Content-Type: application/json" \
  -d '{
    "paymentPayload": {...},
    "paymentRequirements": {...}
  }'
```

## Troubleshooting

### Facilitator Issues

- **Port conflicts**: Change port in facilitator .env if 3001 is in use
- **Private key errors**: Ensure EVM_PRIVATE_KEY is valid 64-char hex
- **RPC errors**: Verify POLYGON_AMOY_RPC URL is accessible

### POLYVERSE Integration

- **Connection failed**: Check X402_FACILITATOR_URL matches facilitator port
- **Agent not starting**: Verify X402_AGENT_ENABLED=true in .env
- **Wallet errors**: Ensure PRIVATE_KEY_AGENT is valid and has test MATIC

### Common Errors

1. **"Invalid private key"**:
   - Check private key format: 0x + 64 hex characters
   - Don't include quotes in .env file

2. **"Facilitator not available"**:
   - Ensure facilitator container is running
   - Check URL in X402_FACILITATOR_URL

3. **"Insufficient funds"**:
   - Add test MATIC to agent wallet for gas
   - Add test USDC for subscription payments

## Demo Scenarios

### Scenario 1: Creator Subscription
1. Connect MetaMask to Polygon Amoy
2. Create subscription plan ($9.99/month)  
3. Another user subscribes
4. Watch agent process monthly payments

### Scenario 2: Payment Failure & Retry
1. Create subscription with insufficient agent funds
2. Watch payment fail and retry logic
3. Add funds and see successful processing

### Scenario 3: Real HTTP 402
1. Set up real facilitator (Option 2 above)
2. Make subscription payment
3. Observe HTTP 402 responses in network tab
4. See real blockchain settlement transactions

## Production Considerations

For production use:

1. **Security**:
   - Use secure key management (not .env files)
   - Implement proper authentication
   - Add rate limiting and monitoring

2. **Scalability**:
   - Use persistent database (not in-memory)
   - Implement queue system for payments
   - Add redundancy and failover

3. **Compliance**:
   - Add KYC/AML checks if required
   - Implement proper logging and auditing
   - Follow local financial regulations

## Resources

- **x402 Documentation**: https://x402.gitbook.io/x402
- **Coinbase x402 API**: https://docs.cdp.coinbase.com/x402/docs/welcome  
- **GitHub Repository**: https://github.com/coinbase/x402
- **Discord Community**: https://discord.gg/invite/cdp

## Support

For issues with the x402 facilitator setup:

1. Check the x402 GitHub issues
2. Join the CDP Discord for community support
3. Review the facilitator logs for error details

The POLYVERSE x402 integration provides a complete example of autonomous subscription payments using the open x402 standard!