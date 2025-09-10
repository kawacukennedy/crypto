const hre = require("hardhat");

async function main() {
  console.log("Starting deployment...");
  
  // Get the contract factory
  const CryptoToken = await hre.ethers.getContractFactory("CryptoToken");
  
  // Deployment parameters
  const tokenName = "CryptoToken";
  const tokenSymbol = "CRYPTO";
  const decimals = 18;
  const initialSupply = hre.ethers.utils.parseUnits("100000000", decimals); // 100 million tokens
  
  console.log("Deploying CryptoToken with parameters:");
  console.log(`Name: ${tokenName}`);
  console.log(`Symbol: ${tokenSymbol}`);
  console.log(`Decimals: ${decimals}`);
  console.log(`Initial Supply: ${hre.ethers.utils.formatUnits(initialSupply, decimals)} tokens`);
  
  // Deploy the contract
  const cryptoToken = await CryptoToken.deploy(
    tokenName,
    tokenSymbol,
    decimals,
    initialSupply
  );
  
  // Wait for deployment to complete
  await cryptoToken.deployed();
  
  const contractAddress = cryptoToken.address;
  console.log(`CryptoToken deployed to: ${contractAddress}`);
  
  // Get deployer info
  const [deployer] = await hre.ethers.getSigners();
  console.log(`Deployed by: ${deployer.address}`);
  
  // Verify deployment by checking token details
  const name = await cryptoToken.name();
  const symbol = await cryptoToken.symbol();
  const totalSupply = await cryptoToken.totalSupply();
  const ownerBalance = await cryptoToken.balanceOf(deployer.address);
  
  console.log("\nDeployment verification:");
  console.log(`Token Name: ${name}`);
  console.log(`Token Symbol: ${symbol}`);
  console.log(`Total Supply: ${hre.ethers.utils.formatUnits(totalSupply, decimals)}`);
  console.log(`Owner Balance: ${hre.ethers.utils.formatUnits(ownerBalance, decimals)}`);
  
  // Save deployment info to a JSON file
  const deploymentInfo = {
    network: hre.network.name,
    contractAddress: contractAddress,
    contractName: "CryptoToken",
    deployer: deployer.address,
    deploymentTime: new Date().toISOString(),
    parameters: {
      name: tokenName,
      symbol: tokenSymbol,
      decimals: decimals,
      initialSupply: initialSupply.toString()
    },
    transactionHash: cryptoToken.deployTransaction.hash
  };
  
  console.log("\nDeployment completed successfully!");
  console.log("Deployment info:", JSON.stringify(deploymentInfo, null, 2));
}

// Error handling
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
