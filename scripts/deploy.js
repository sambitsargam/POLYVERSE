const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("Deploying PolyverseStorefront to Filecoin Calibration testnet...");

  // Get the deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  // Check balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "FIL");

  if (balance == 0n) {
    console.error("Deployer account has no FIL. Please fund the account first.");
    console.log("Get testnet FIL from: https://faucet.calibration.fildev.network/");
    process.exit(1);
  }

  // Deploy the contract
  console.log("Deploying PolyverseStorefront...");
  const PolyverseStorefront = await hre.ethers.getContractFactory("PolyverseStorefront");
  
  const contract = await PolyverseStorefront.deploy();
  await contract.waitForDeployment();
  
  const contractAddress = await contract.getAddress();
  console.log("PolyverseStorefront deployed to:", contractAddress);

  // Verify deployment
  console.log("Verifying deployment...");
  const owner = await contract.owner();
  console.log("Contract owner:", owner);
  console.log("Deployer address:", deployer.address);
  
  if (owner.toLowerCase() === deployer.address.toLowerCase()) {
    console.log("✅ Contract deployed successfully!");
  } else {
    console.log("❌ Contract deployment verification failed!");
  }

  // Update the contract addresses in the frontend
  console.log("\nUpdating contract addresses...");
  
  const contractsPath = path.join(__dirname, '..', 'src', 'lib', 'contracts.ts');
  let contractsContent = fs.readFileSync(contractsPath, 'utf8');
  
  // Update the Filecoin Calibration testnet address
  contractsContent = contractsContent.replace(
    /314159: \{[\s\S]*?POLYVERSE_STOREFRONT: '[^']*'/,
    `314159: {\n    POLYVERSE_STOREFRONT: '${contractAddress}'`
  );
  
  fs.writeFileSync(contractsPath, contractsContent);
  console.log("✅ Contract address updated in frontend");

  // Create deployment report
  const deploymentInfo = {
    network: "filecoin-calibration",
    chainId: 314159,
    contractAddress: contractAddress,
    deployerAddress: deployer.address,
    blockNumber: await hre.ethers.provider.getBlockNumber(),
    gasUsed: "TBD", // Will be filled by transaction receipt
    timestamp: new Date().toISOString(),
    transactionHash: contract.deploymentTransaction()?.hash || "unknown"
  };

  const reportsDir = path.join(__dirname, '..', 'deployment-reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir);
  }
  
  const reportPath = path.join(reportsDir, `deployment-${Date.now()}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(deploymentInfo, null, 2));
  console.log("✅ Deployment report saved to:", reportPath);

  console.log("\n🎉 Deployment completed successfully!");
  console.log("📋 Summary:");
  console.log(`   Contract Address: ${contractAddress}`);
  console.log(`   Network: Filecoin Calibration (${hre.network.name})`);
  console.log(`   Chain ID: 314159`);
  console.log(`   Deployer: ${deployer.address}`);
  console.log(`   Transaction: ${deploymentInfo.transactionHash}`);
  
  console.log("\n🚀 Next steps:");
  console.log("1. Fund your account: https://faucet.calibration.fildev.network/");
  console.log("2. Test the contract functions through the frontend");
  console.log("3. Register as a creator and create your first product!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });