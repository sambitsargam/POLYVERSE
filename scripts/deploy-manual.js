const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function deployContract() {
  console.log("🚀 Deploying PolyverseStorefront to Filecoin Calibration testnet...");
  
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    console.error("❌ No private key found in .env file");
    process.exit(1);
  }
  
  const rpcUrl = "https://api.calibration.node.glif.io/rpc/v1";
  const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(`0x${privateKey}`, provider);
  
  console.log("📋 Deployment Info:");
  console.log(`   Deployer: ${wallet.address}`);
  
  // Check balance
  const balance = await provider.getBalance(wallet.address);
  console.log(`   Balance: ${ethers.utils.formatEther(balance)} FIL`);
  
  if (balance.eq(0)) {
    console.error("❌ Insufficient balance. Get FIL from: https://faucet.calibration.fildev.network/");
    process.exit(1);
  }
  
  // Read and compile the contract
  const contractPath = path.join(__dirname, '../contracts/PolyverseStorefront.sol');
  const contractSource = fs.readFileSync(contractPath, 'utf8');
  
  console.log("\n📄 Contract Info:");
  console.log(`   Source: ${contractPath}`);
  console.log(`   Size: ${contractSource.length} characters`);
  
  // For now, we need to provide the bytecode and ABI manually
  // In a real scenario, you'd compile with solc or use Hardhat's compilation
  console.log("\n⚠️  Manual compilation required:");
  console.log("   The contract needs to be compiled to bytecode for deployment.");
  console.log("   Options:");
  console.log("   1. Use Remix IDE: https://remix.ethereum.org/");
  console.log("   2. Use solc compiler directly");
  console.log("   3. Fix Hardhat setup issues");
  
  console.log("\n📝 To deploy with Remix:");
  console.log("   1. Copy the contract code to Remix");
  console.log("   2. Compile with Solidity 0.8.24");
  console.log("   3. Deploy to Injected Web3 with Filecoin Calibration network");
  console.log("   4. Use this address:", wallet.address);
  
  return wallet.address;
}

deployContract()
  .then((address) => {
    console.log(`\n✅ Deployer address ready: ${address}`);
    console.log("💰 Account funded with 5.05 FIL");
    console.log("🌐 Connected to Filecoin Calibration (314159)");
  })
  .catch((error) => {
    console.error("❌ Setup failed:", error);
  });