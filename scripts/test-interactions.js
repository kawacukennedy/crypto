const hre = require("hardhat");

async function main() {
  console.log("🚀 Testing CryptoToken Contract Interactions");
  console.log("==========================================");
  
  // Get signers
  const [owner, addr1, addr2] = await hre.ethers.getSigners();
  
  console.log("📝 Accounts:");
  console.log(`Owner: ${owner.address}`);
  console.log(`Address 1: ${addr1.address}`);
  console.log(`Address 2: ${addr2.address}`);
  
  // Get deployed contract
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const CryptoToken = await hre.ethers.getContractFactory("CryptoToken");
  const cryptoToken = CryptoToken.attach(contractAddress);
  
  console.log(`\n📄 Contract: ${contractAddress}`);
  
  // Get initial info
  const name = await cryptoToken.name();
  const symbol = await cryptoToken.symbol();
  const decimals = await cryptoToken.decimals();
  const initialTotalSupply = await cryptoToken.totalSupply();
  const ownerBalance = await cryptoToken.balanceOf(owner.address);
  
  console.log(`\n💰 Token Info:`);
  console.log(`Name: ${name}`);
  console.log(`Symbol: ${symbol}`);
  console.log(`Decimals: ${decimals}`);
  console.log(`Total Supply: ${hre.ethers.utils.formatUnits(initialTotalSupply, decimals)}`);
  console.log(`Owner Balance: ${hre.ethers.utils.formatUnits(ownerBalance, decimals)}`);
  
  // Test 1: Transfer
  console.log(`\n🔄 Test 1: Transfer Tokens`);
  const transferAmount = hre.ethers.utils.parseUnits("1000", decimals);
  
  console.log(`Transferring 1,000 ${symbol} to ${addr1.address}`);
  const transferTx = await cryptoToken.transfer(addr1.address, transferAmount);
  await transferTx.wait();
  
  const addr1Balance = await cryptoToken.balanceOf(addr1.address);
  console.log(`✅ Address 1 balance: ${hre.ethers.utils.formatUnits(addr1Balance, decimals)} ${symbol}`);
  
  // Test 2: Approval and TransferFrom
  console.log(`\n📋 Test 2: Approval and TransferFrom`);
  const approvalAmount = hre.ethers.utils.parseUnits("500", decimals);
  
  console.log(`Address 1 approving ${hre.ethers.utils.formatUnits(approvalAmount, decimals)} ${symbol} to Address 2`);
  const approveTx = await cryptoToken.connect(addr1).approve(addr2.address, approvalAmount);
  await approveTx.wait();
  
  const allowance = await cryptoToken.allowance(addr1.address, addr2.address);
  console.log(`✅ Allowance: ${hre.ethers.utils.formatUnits(allowance, decimals)} ${symbol}`);
  
  console.log(`Address 2 transferring 200 ${symbol} from Address 1 to Owner`);
  const transferFromAmount = hre.ethers.utils.parseUnits("200", decimals);
  const transferFromTx = await cryptoToken.connect(addr2).transferFrom(addr1.address, owner.address, transferFromAmount);
  await transferFromTx.wait();
  
  const newAllowance = await cryptoToken.allowance(addr1.address, addr2.address);
  const newAddr1Balance = await cryptoToken.balanceOf(addr1.address);
  console.log(`✅ New Address 1 balance: ${hre.ethers.utils.formatUnits(newAddr1Balance, decimals)} ${symbol}`);
  console.log(`✅ Remaining allowance: ${hre.ethers.utils.formatUnits(newAllowance, decimals)} ${symbol}`);
  
  // Test 3: Batch Transfer
  console.log(`\n📦 Test 3: Batch Transfer`);
  const batchRecipients = [addr1.address, addr2.address];
  const batchAmounts = [
    hre.ethers.utils.parseUnits("100", decimals),
    hre.ethers.utils.parseUnits("150", decimals)
  ];
  
  console.log(`Batch transferring to multiple addresses`);
  const batchTx = await cryptoToken.batchTransfer(batchRecipients, batchAmounts);
  await batchTx.wait();
  
  const finalAddr1Balance = await cryptoToken.balanceOf(addr1.address);
  const finalAddr2Balance = await cryptoToken.balanceOf(addr2.address);
  console.log(`✅ Address 1 balance: ${hre.ethers.utils.formatUnits(finalAddr1Balance, decimals)} ${symbol}`);
  console.log(`✅ Address 2 balance: ${hre.ethers.utils.formatUnits(finalAddr2Balance, decimals)} ${symbol}`);
  
  // Test 4: Minting (Owner only)
  console.log(`\n🪙 Test 4: Minting (Owner Only)`);
  const mintAmount = hre.ethers.utils.parseUnits("50000", decimals);
  
  console.log(`Owner minting 50,000 ${symbol} to Address 1`);
  const mintTx = await cryptoToken.mint(addr1.address, mintAmount);
  await mintTx.wait();
  
  const mintedBalance = await cryptoToken.balanceOf(addr1.address);
  const newTotalSupply = await cryptoToken.totalSupply();
  console.log(`✅ Address 1 balance after mint: ${hre.ethers.utils.formatUnits(mintedBalance, decimals)} ${symbol}`);
  console.log(`✅ New total supply: ${hre.ethers.utils.formatUnits(newTotalSupply, decimals)} ${symbol}`);
  
  // Test 5: Burning
  console.log(`\n🔥 Test 5: Burning Tokens`);
  const burnAmount = hre.ethers.utils.parseUnits("1000", decimals);
  
  console.log(`Address 1 burning 1,000 ${symbol}`);
  const burnTx = await cryptoToken.connect(addr1).burn(burnAmount);
  await burnTx.wait();
  
  const burnedBalance = await cryptoToken.balanceOf(addr1.address);
  const finalTotalSupply = await cryptoToken.totalSupply();
  console.log(`✅ Address 1 balance after burn: ${hre.ethers.utils.formatUnits(burnedBalance, decimals)} ${symbol}`);
  console.log(`✅ Final total supply: ${hre.ethers.utils.formatUnits(finalTotalSupply, decimals)} ${symbol}`);
  
  // Test 6: Error Cases
  console.log(`\n❌ Test 6: Error Cases`);
  
  try {
    console.log(`Testing: Non-owner trying to mint`);
    await cryptoToken.connect(addr1).mint(addr2.address, hre.ethers.utils.parseUnits("1000", decimals));
  } catch (error) {
    console.log(`✅ Correctly rejected: ${error.reason || 'OwnableUnauthorizedAccount'}`);
  }
  
  try {
    console.log(`Testing: Transfer more than balance`);
    await cryptoToken.connect(addr2).transfer(owner.address, hre.ethers.utils.parseUnits("999999", decimals));
  } catch (error) {
    console.log(`✅ Correctly rejected: ${error.reason || 'ERC20InsufficientBalance'}`);
  }
  
  // Final Summary
  console.log(`\n📊 Final Summary`);
  console.log("================");
  const finalOwnerBalance = await cryptoToken.balanceOf(owner.address);
  const finalAddr1BalanceEnd = await cryptoToken.balanceOf(addr1.address);
  const finalAddr2BalanceEnd = await cryptoToken.balanceOf(addr2.address);
  const endTotalSupply = await cryptoToken.totalSupply();
  
  console.log(`Owner Balance: ${hre.ethers.utils.formatUnits(finalOwnerBalance, decimals)} ${symbol}`);
  console.log(`Address 1 Balance: ${hre.ethers.utils.formatUnits(finalAddr1BalanceEnd, decimals)} ${symbol}`);
  console.log(`Address 2 Balance: ${hre.ethers.utils.formatUnits(finalAddr2BalanceEnd, decimals)} ${symbol}`);
  console.log(`Total Supply: ${hre.ethers.utils.formatUnits(endTotalSupply, decimals)} ${symbol}`);
  
  console.log(`\n🎉 All tests completed successfully!`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Test failed:", error);
    process.exit(1);
  });
