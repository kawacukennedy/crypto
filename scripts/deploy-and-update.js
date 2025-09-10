const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("Starting deployment and frontend update...");
  
  // Deploy the token contract
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
  console.log(`CryptoToken deployed to: ${cryptoToken.address}`);
  
  // Deploy the games contract
  console.log("Deploying CryptoGames...");
  const CryptoGames = await hre.ethers.getContractFactory("CryptoGames");
  const cryptoGames = await CryptoGames.deploy(cryptoToken.address);
  
  await cryptoGames.deployed();
  console.log(`CryptoGames deployed to: ${cryptoGames.address}`);
  
  // Fund the games contract with tokens for payouts (10M tokens)
  const houseFunds = hre.ethers.utils.parseUnits("10000000", decimals);
  console.log("Approving and depositing house funds...");
  await cryptoToken.approve(cryptoGames.address, houseFunds);
  await cryptoGames.depositHouseFunds(houseFunds);
  console.log(`Deposited ${hre.ethers.utils.formatUnits(houseFunds, decimals)} tokens to house`);
  
  const tokenAddress = cryptoToken.address;
  const gamesAddress = cryptoGames.address;
  const network = await hre.ethers.provider.getNetwork();
  
  console.log(`Network: ${network.name} (${network.chainId})`);
  
  // Update frontend contract configuration
  const frontendConfigPath = path.join(__dirname, '../frontend/src/utils/contracts.ts');
  
  try {
    let configContent = fs.readFileSync(frontendConfigPath, 'utf8');
    
    // Update the token contract address for the current network
    const tokenAddressRegex = new RegExp(`(${network.chainId}:\\s*')[^']*(')`);
    
    if (configContent.match(tokenAddressRegex)) {
      configContent = configContent.replace(tokenAddressRegex, `$1${tokenAddress}$2`);
      console.log(`Updated token contract address for network ${network.chainId}`);
    } else {
      console.log(`Network ${network.chainId} not found in config, adding it...`);
      // Add the network if it doesn't exist
      const addressSection = configContent.match(/(export const CONTRACT_ADDRESSES[^}]*)/);
      if (addressSection) {
        const newEntry = `  ${network.chainId}: '${tokenAddress}',`;
        configContent = configContent.replace(
          /(export const CONTRACT_ADDRESSES[^}]*)/,
          `$1  ${newEntry}\n`
        );
      }
    }
    
    // Update or add games contract addresses
    const gamesAddressRegex = /export const GAMES_CONTRACT_ADDRESSES[^}]*}/;
    const gamesSection = `export const GAMES_CONTRACT_ADDRESSES: { [key: number]: string } = {
  ${network.chainId}: '${gamesAddress}',
};`;
    
    if (configContent.match(gamesAddressRegex)) {
      configContent = configContent.replace(gamesAddressRegex, gamesSection);
      console.log(`Updated games contract address for network ${network.chainId}`);
    } else {
      // Add games contract addresses if not exists
      configContent += `\n\n${gamesSection}\n`;
      console.log(`Added games contract addresses`);
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
  const houseBalance = await cryptoGames.houseBalance();
  const stats = await cryptoGames.getStats();
  
  console.log("\n=== Deployment Summary ===");
  console.log(`Token Contract: ${tokenAddress}`);
  console.log(`Games Contract: ${gamesAddress}`);
  console.log(`Network: ${network.name} (Chain ID: ${network.chainId})`);
  console.log(`Token Name: ${name}`);
  console.log(`Token Symbol: ${symbol}`);
  console.log(`Total Supply: ${hre.ethers.utils.formatUnits(totalSupply, decimals)}`);
  console.log(`Owner Balance: ${hre.ethers.utils.formatUnits(ownerBalance, decimals)}`);
  console.log(`House Balance: ${hre.ethers.utils.formatUnits(houseBalance, decimals)}`);
  console.log(`Deployer: ${deployer.address}`);
  
  console.log("\n=== Games Contract Info ===");
  console.log(`Min Bet: ${hre.ethers.utils.formatUnits(await cryptoGames.MIN_BET(), decimals)} ${symbol}`);
  console.log(`Max Bet: ${hre.ethers.utils.formatUnits(await cryptoGames.MAX_BET(), decimals)} ${symbol}`);
  console.log(`House Edge: ${(await cryptoGames.HOUSE_EDGE()) / 100}%`);
  
  console.log("\n=== Next Steps ===");
  console.log("1. Start the frontend: cd frontend && npm start");
  console.log("2. Connect MetaMask to the local network");
  console.log("3. Import the deployer account to MetaMask for testing");
  console.log("4. Play games with real token transactions!");
  console.log(`5. Deployer private key: ${process.env.PRIVATE_KEY || 'Check your .env file'}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
