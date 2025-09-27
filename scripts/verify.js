const hre = require("hardhat");

async function main() {
  const contractAddress = process.argv[2];
  
  if (!contractAddress) {
    console.log("Usage: npx hardhat run scripts/verify.js --network filecoinCalibration <CONTRACT_ADDRESS>");
    process.exit(1);
  }

  console.log("Verifying contract at address:", contractAddress);

  try {
    await hre.run("verify:verify", {
      address: contractAddress,
      constructorArguments: [], // PolyverseStorefront has no constructor args
    });
    
    console.log("✅ Contract verified successfully!");
  } catch (error) {
    console.log("❌ Verification failed:", error.message);
    
    if (error.message.includes("Already Verified")) {
      console.log("✅ Contract is already verified!");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });