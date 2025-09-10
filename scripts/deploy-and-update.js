const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("Starting deployment and frontend update...");
  
  // Deploy the contract
  const CryptoToken = await hre.ethers.getContractFactory("CryptoToken");
  
  // Deployment parameters
  const tokenName = "CryptoToken";
  const tokenSymbol = "CRYPTO";
  const decimals = 18;
  const initialSupply = hre.ethers.utils.parseUnits("100000000", decimals);
  
  console.log("Deploying CryptoToken...");
  const cryptoToken = await CryptoToken.deploy(
    tokenName,
    tokenSymbol,
    decimals,
    initialSupply
  );
  
  await cryptoToken.deployed();
  
  const contractAddress = cryptoToken.address;
  const network = await hre.ethers.provider.getNetwork();
  
  console.log(`CryptoToken deployed to: ${contractAddress}`);
  console.log(`Network: ${network.name} (${network.chainId})`);
  
  // Update frontend contract configuration
  const frontendConfigPath = path.join(__dirname, '../frontend/src/utils/contracts.ts');
  
  try {
    let configContent = fs.readFileSync(frontendConfigPath, 'utf8');
    
    // Update the contract address for the current network
    const addressRegex = new RegExp(`(${network.chainId}:\\s*')[^']*(')`);
    
    if (configContent.match(addressRegex)) {
      configContent = configContent.replace(addressRegex, `$1${contractAddress}$2`);
      console.log(`Updated contract address for network ${network.chainId}`);
    } else {
      console.log(`Network ${network.chainId} not found in config, adding it...`);
      // Add the network if it doesn't exist
      const addressSection = configContent.match(/(export const CONTRACT_ADDRESSES[^}]*)/);
      if (addressSection) {
        const newEntry = `  ${network.chainId}: '${contractAddress}',`;
        configContent = configContent.replace(
          /(export const CONTRACT_ADDRESSES[^}]*)/,
          `$1  ${newEntry}\n`
        );
      }
    }
    
    fs.writeFileSync(frontendConfigPath, configContent);
    console.log("Frontend configuration updated successfully!");
    
  } catch (error) {
    console.error("Error updating frontend configuration:", error.message);
  }
  
  // Verify deployment
  const [deployer] = await hre.ethers.getSigners();
  const name = await cryptoToken.name();
  const symbol = await cryptoToken.symbol();
  const totalSupply = await cryptoToken.totalSupply();
  const ownerBalance = await cryptoToken.balanceOf(deployer.address);
  
  console.log("\n=== Deployment Summary ===");
  console.log(`Contract Address: ${contractAddress}`);
  console.log(`Network: ${network.name} (Chain ID: ${network.chainId})`);
  console.log(`Token Name: ${name}`);
  console.log(`Token Symbol: ${symbol}`);
  console.log(`Total Supply: ${hre.ethers.utils.formatUnits(totalSupply, decimals)}`);
  console.log(`Owner Balance: ${hre.ethers.utils.formatUnits(ownerBalance, decimals)}`);
  console.log(`Deployer: ${deployer.address}`);
  
  console.log("\n=== Next Steps ===");
  console.log("1. Start the frontend: cd frontend && npm start");
  console.log("2. Connect MetaMask to the local network");
  console.log("3. Import the deployer account to MetaMask for testing");
  console.log(`4. Deployer private key: ${process.env.PRIVATE_KEY || 'Check your .env file'}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
