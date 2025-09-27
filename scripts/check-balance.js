const { ethers } = require('ethers');
require('dotenv').config();

async function checkBalance() {
  console.log("Checking account balance...");
  
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    console.error("No private key found in .env file");
    return;
  }
  
  const rpcUrl = "https://api.calibration.node.glif.io/rpc/v1";
  const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  
  // Create wallet
  const wallet = new ethers.Wallet(`0x${privateKey}`, provider);
  
  console.log("Account address:", wallet.address);
  
  try {
    const balance = await provider.getBalance(wallet.address);
    console.log("Balance:", ethers.utils.formatEther(balance), "FIL");
    
    if (balance.eq(0)) {
      console.log("\n💡 Get testnet FIL from: https://faucet.calibration.fildev.network/");
      console.log("   Use address:", wallet.address);
    }
    
    // Check network
    const network = await provider.getNetwork();
    console.log("Connected to chain ID:", network.chainId);
    
  } catch (error) {
    console.error("Error checking balance:", error.message);
  }
}

checkBalance();