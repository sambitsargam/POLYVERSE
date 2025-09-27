const solc = require('solc');
const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

function findImports(importPath) {
  // Handle OpenZeppelin imports
  if (importPath.startsWith('@openzeppelin/')) {
    try {
      const contractPath = path.join(__dirname, '../node_modules', importPath);
      const source = fs.readFileSync(contractPath, 'utf8');
      return { contents: source };
    } catch (error) {
      console.error(`Could not resolve import: ${importPath}`);
      return { error: 'File not found' };
    }
  }
  
  // Handle local imports
  try {
    const contractPath = path.join(__dirname, '../contracts', importPath);
    const source = fs.readFileSync(contractPath, 'utf8');
    return { contents: source };
  } catch (error) {
    console.error(`Could not resolve import: ${importPath}`);
    return { error: 'File not found' };
  }
}

async function deployContract() {
  console.log("🚀 Compiling and deploying PolyverseStorefront...");
  
  // Read contract source
  const contractPath = path.join(__dirname, '../contracts/PolyverseStorefront.sol');
  const contractSource = fs.readFileSync(contractPath, 'utf8');
  
  console.log("📄 Compiling contract...");
  
  // Prepare input for Solidity compiler
  const input = {
    language: 'Solidity',
    sources: {
      'PolyverseStorefront.sol': {
        content: contractSource
      }
    },
    settings: {
      outputSelection: {
        '*': {
          '*': ['abi', 'evm.bytecode']
        }
      },
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  };
  
  // Compile with import resolver
  const compiledContract = solc.compile(JSON.stringify(input), { import: findImports });
  const output = JSON.parse(compiledContract);
  
  // Check for compilation errors
  if (output.errors) {
    console.log("⚠️ Compilation messages:");
    output.errors.forEach(error => {
      console.log(`   ${error.severity}: ${error.message}`);
    });
    
    // Stop if there are serious errors
    const hasError = output.errors.some(error => error.severity === 'error');
    if (hasError) {
      console.error("❌ Compilation failed");
      process.exit(1);
    }
  }
  
  const contractOutput = output.contracts['PolyverseStorefront.sol']['PolyverseStorefront'];
  if (!contractOutput) {
    console.error("❌ Contract not found in compilation output");
    console.log("Available contracts:", Object.keys(output.contracts['PolyverseStorefront.sol'] || {}));
    process.exit(1);
  }
  
  const abi = contractOutput.abi;
  const bytecode = contractOutput.evm.bytecode.object;
  
  console.log("✅ Compilation successful!");
  console.log(`   Bytecode length: ${bytecode.length} characters`);
  console.log(`   ABI methods: ${abi.length}`);
  
  // Setup deployment
  const privateKey = process.env.PRIVATE_KEY;
  const rpcUrl = "https://api.calibration.node.glif.io/rpc/v1";
  const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(`0x${privateKey}`, provider);
  
  console.log("\n🌐 Network Info:");
  const network = await provider.getNetwork();
  console.log(`   Chain ID: ${network.chainId}`);
  console.log(`   Deployer: ${wallet.address}`);
  
  const balance = await provider.getBalance(wallet.address);
  console.log(`   Balance: ${ethers.utils.formatEther(balance)} FIL`);
  
  // Create contract factory
  const contractFactory = new ethers.ContractFactory(abi, bytecode, wallet);
  
  console.log("\n🚀 Deploying contract...");
  
  try {
    // Deploy with constructor arguments (token addresses)
    // For testnet, we'll use mock addresses - these should be real token contracts in production
    const mockUSDCAddress = "0x0000000000000000000000000000000000000001"; // Mock USDC
    const mockUSDFCAddress = "0x0000000000000000000000000000000000000002"; // Mock USDFC
    
    const contract = await contractFactory.deploy(mockUSDCAddress, mockUSDFCAddress);
    console.log(`   Transaction hash: ${contract.deployTransaction.hash}`);
    
    // Wait for deployment
    console.log("⏳ Waiting for deployment confirmation...");
    await contract.deployed();
    
    console.log("✅ Contract deployed successfully!");
    console.log(`   Contract address: ${contract.address}`);
    
    // Verify the deployment
    console.log("\n🔍 Verifying deployment...");
    const owner = await contract.owner();
    console.log(`   Contract owner: ${owner}`);
    
    // Update frontend contract addresses
    console.log("\n📝 Updating frontend configuration...");
    const contractsPath = path.join(__dirname, '..', 'src', 'lib', 'contracts.ts');
    let contractsContent = fs.readFileSync(contractsPath, 'utf8');
    
    // Update the Filecoin Calibration testnet address
    contractsContent = contractsContent.replace(
      /314159: \{[\s\S]*?POLYVERSE_STOREFRONT: '[^']*'/,
      `314159: {\n    POLYVERSE_STOREFRONT: '${contract.address}'`
    );
    
    fs.writeFileSync(contractsPath, contractsContent);
    console.log("✅ Frontend configuration updated");
    
    // Save deployment info
    const deploymentInfo = {
      network: "filecoin-calibration", 
      chainId: 314159,
      contractAddress: contract.address,
      deployerAddress: wallet.address,
      transactionHash: contract.deployTransaction.hash,
      blockNumber: contract.deployTransaction.blockNumber,
      gasUsed: contract.deployTransaction.gasLimit?.toString(),
      timestamp: new Date().toISOString(),
      abi: abi,
      bytecode: bytecode
    };
    
    const reportsDir = path.join(__dirname, '..', 'deployment-reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir);
    }
    
    const reportPath = path.join(reportsDir, `deployment-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(deploymentInfo, null, 2));
    console.log(`✅ Deployment report saved: ${reportPath}`);
    
    console.log("\n🎉 Deployment Complete!");
    console.log("📋 Summary:");
    console.log(`   Contract: ${contract.address}`);
    console.log(`   Network: Filecoin Calibration`);
    console.log(`   Chain ID: 314159`);
    console.log(`   Owner: ${owner}`);
    console.log(`   Transaction: ${contract.deployTransaction.hash}`);
    
    console.log("\n🚀 Next Steps:");
    console.log("1. Test contract functions through the frontend");
    console.log("2. Register as a creator");
    console.log("3. Create and sell digital products!");
    
  } catch (error) {
    console.error("❌ Deployment failed:", error.message);
    if (error.reason) {
      console.error("   Reason:", error.reason);
    }
    if (error.transaction) {
      console.error("   Transaction:", error.transaction);
    }
    process.exit(1);
  }
}

deployContract();