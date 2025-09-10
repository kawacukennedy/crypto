const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CryptoToken", function () {
  let CryptoToken;
  let cryptoToken;
  let owner;
  let addr1;
  let addr2;
  let addrs;

  // Token parameters
  const tokenName = "CryptoToken";
  const tokenSymbol = "CRYPTO";
  const decimals = 18;
  const initialSupply = ethers.utils.parseUnits("100000000", decimals); // 100 million tokens
  const maxSupply = ethers.utils.parseUnits("1000000000", decimals); // 1 billion tokens

  beforeEach(async function () {
    // Get the ContractFactory and Signers here.
    CryptoToken = await ethers.getContractFactory("CryptoToken");
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    // Deploy a new CryptoToken contract for each test
    cryptoToken = await CryptoToken.deploy(tokenName, tokenSymbol, decimals, initialSupply);
    await cryptoToken.deployed();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await cryptoToken.owner()).to.equal(owner.address);
    });

    it("Should assign the total supply of tokens to the owner", async function () {
      const ownerBalance = await cryptoToken.balanceOf(owner.address);
      expect(await cryptoToken.totalSupply()).to.equal(ownerBalance);
    });

    it("Should set the correct token name and symbol", async function () {
      expect(await cryptoToken.name()).to.equal(tokenName);
      expect(await cryptoToken.symbol()).to.equal(tokenSymbol);
    });

    it("Should set the correct decimals", async function () {
      expect(await cryptoToken.decimals()).to.equal(decimals);
    });

    it("Should have correct initial supply", async function () {
      expect(await cryptoToken.totalSupply()).to.equal(initialSupply);
    });

    it("Should revert if initial supply exceeds max supply", async function () {
      const excessiveSupply = ethers.utils.parseUnits("2000000000", decimals);
      await expect(
        CryptoToken.deploy(tokenName, tokenSymbol, decimals, excessiveSupply)
      ).to.be.revertedWith("Initial supply exceeds maximum supply");
    });

    it("Should revert if decimals exceed 18", async function () {
      await expect(
        CryptoToken.deploy(tokenName, tokenSymbol, 19, initialSupply)
      ).to.be.revertedWith("Decimals cannot exceed 18");
    });
  });

  describe("Transactions", function () {
    it("Should transfer tokens between accounts", async function () {
      const transferAmount = ethers.utils.parseUnits("50", decimals);
      
      // Transfer 50 tokens from owner to addr1
      await cryptoToken.transfer(addr1.address, transferAmount);
      const addr1Balance = await cryptoToken.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(transferAmount);

      // Transfer 50 tokens from addr1 to addr2
      await cryptoToken.connect(addr1).transfer(addr2.address, transferAmount);
      const addr2Balance = await cryptoToken.balanceOf(addr2.address);
      expect(addr2Balance).to.equal(transferAmount);
    });

    it("Should fail if sender doesn't have enough tokens", async function () {
      const initialOwnerBalance = await cryptoToken.balanceOf(owner.address);
      const excessiveAmount = initialOwnerBalance.add(1);

      // Try to send more tokens than owner has
      await expect(
        cryptoToken.connect(owner).transfer(addr1.address, excessiveAmount)
      ).to.be.revertedWith("ERC20InsufficientBalance");

      // Owner balance shouldn't have changed
      expect(await cryptoToken.balanceOf(owner.address)).to.equal(initialOwnerBalance);
    });

    it("Should update balances after transfers", async function () {
      const initialOwnerBalance = await cryptoToken.balanceOf(owner.address);
      const transferAmount = ethers.utils.parseUnits("100", decimals);

      // Transfer tokens
      await cryptoToken.transfer(addr1.address, transferAmount);

      // Check balances
      expect(await cryptoToken.balanceOf(owner.address)).to.equal(
        initialOwnerBalance.sub(transferAmount)
      );
      expect(await cryptoToken.balanceOf(addr1.address)).to.equal(transferAmount);
    });
  });

  describe("Minting", function () {
    it("Should allow owner to mint new tokens", async function () {
      const mintAmount = ethers.utils.parseUnits("1000000", decimals);
      const initialSupply = await cryptoToken.totalSupply();

      await cryptoToken.mint(addr1.address, mintAmount);

      expect(await cryptoToken.totalSupply()).to.equal(initialSupply.add(mintAmount));
      expect(await cryptoToken.balanceOf(addr1.address)).to.equal(mintAmount);
    });

    it("Should emit TokensMinted event when minting", async function () {
      const mintAmount = ethers.utils.parseUnits("1000", decimals);

      await expect(cryptoToken.mint(addr1.address, mintAmount))
        .to.emit(cryptoToken, "TokensMinted")
        .withArgs(addr1.address, mintAmount);
    });

    it("Should reject minting by non-owner", async function () {
      const mintAmount = ethers.utils.parseUnits("1000", decimals);

      await expect(
        cryptoToken.connect(addr1).mint(addr2.address, mintAmount)
      ).to.be.revertedWith("OwnableUnauthorizedAccount");
    });

    it("Should reject minting to zero address", async function () {
      const mintAmount = ethers.utils.parseUnits("1000", decimals);

      await expect(
        cryptoToken.mint(ethers.constants.AddressZero, mintAmount)
      ).to.be.revertedWith("Cannot mint to zero address");
    });

    it("Should reject minting if it would exceed max supply", async function () {
      const currentSupply = await cryptoToken.totalSupply();
      const excessiveMint = maxSupply.sub(currentSupply).add(1);

      await expect(
        cryptoToken.mint(addr1.address, excessiveMint)
      ).to.be.revertedWith("Minting would exceed maximum supply");
    });
  });

  describe("Burning", function () {
    beforeEach(async function () {
      // Transfer some tokens to addr1 for burning tests
      const transferAmount = ethers.utils.parseUnits("1000", decimals);
      await cryptoToken.transfer(addr1.address, transferAmount);
    });

    it("Should allow token holders to burn their tokens", async function () {
      const burnAmount = ethers.utils.parseUnits("100", decimals);
      const initialBalance = await cryptoToken.balanceOf(addr1.address);
      const initialSupply = await cryptoToken.totalSupply();

      await cryptoToken.connect(addr1).burn(burnAmount);

      expect(await cryptoToken.balanceOf(addr1.address)).to.equal(
        initialBalance.sub(burnAmount)
      );
      expect(await cryptoToken.totalSupply()).to.equal(initialSupply.sub(burnAmount));
    });

    it("Should emit TokensBurned event when burning", async function () {
      const burnAmount = ethers.utils.parseUnits("100", decimals);

      await expect(cryptoToken.connect(addr1).burn(burnAmount))
        .to.emit(cryptoToken, "TokensBurned")
        .withArgs(addr1.address, burnAmount);
    });

    it("Should allow approved spender to burn tokens", async function () {
      const burnAmount = ethers.utils.parseUnits("50", decimals);
      const initialBalance = await cryptoToken.balanceOf(addr1.address);
      const initialSupply = await cryptoToken.totalSupply();

      // Approve addr2 to spend tokens from addr1
      await cryptoToken.connect(addr1).approve(addr2.address, burnAmount);

      // addr2 burns tokens from addr1
      await cryptoToken.connect(addr2).burnFrom(addr1.address, burnAmount);

      expect(await cryptoToken.balanceOf(addr1.address)).to.equal(
        initialBalance.sub(burnAmount)
      );
      expect(await cryptoToken.totalSupply()).to.equal(initialSupply.sub(burnAmount));
    });

    it("Should reject burning more tokens than balance", async function () {
      const balance = await cryptoToken.balanceOf(addr1.address);
      const excessiveBurn = balance.add(1);

      await expect(
        cryptoToken.connect(addr1).burn(excessiveBurn)
      ).to.be.revertedWith("ERC20InsufficientBalance");
    });
  });

  describe("Batch Transfer", function () {
    it("Should transfer tokens to multiple recipients", async function () {
      const recipients = [addr1.address, addr2.address];
      const amounts = [
        ethers.utils.parseUnits("100", decimals),
        ethers.utils.parseUnits("200", decimals)
      ];

      await cryptoToken.batchTransfer(recipients, amounts);

      expect(await cryptoToken.balanceOf(addr1.address)).to.equal(amounts[0]);
      expect(await cryptoToken.balanceOf(addr2.address)).to.equal(amounts[1]);
    });

    it("Should reject batch transfer with mismatched arrays", async function () {
      const recipients = [addr1.address, addr2.address];
      const amounts = [ethers.utils.parseUnits("100", decimals)]; // One less amount

      await expect(
        cryptoToken.batchTransfer(recipients, amounts)
      ).to.be.revertedWith("Arrays length mismatch");
    });

    it("Should reject batch transfer with empty arrays", async function () {
      await expect(
        cryptoToken.batchTransfer([], [])
      ).to.be.revertedWith("Empty arrays");
    });

    it("Should reject batch transfer to zero address", async function () {
      const recipients = [ethers.constants.AddressZero];
      const amounts = [ethers.utils.parseUnits("100", decimals)];

      await expect(
        cryptoToken.batchTransfer(recipients, amounts)
      ).to.be.revertedWith("Cannot transfer to zero address");
    });
  });

  describe("Allowances", function () {
    it("Should approve and transfer using allowance", async function () {
      const approveAmount = ethers.utils.parseUnits("100", decimals);
      const transferAmount = ethers.utils.parseUnits("50", decimals);

      // Owner approves addr1 to spend tokens
      await cryptoToken.approve(addr1.address, approveAmount);
      expect(await cryptoToken.allowance(owner.address, addr1.address)).to.equal(approveAmount);

      // addr1 transfers tokens from owner to addr2
      await cryptoToken.connect(addr1).transferFrom(owner.address, addr2.address, transferAmount);
      
      expect(await cryptoToken.balanceOf(addr2.address)).to.equal(transferAmount);
      expect(await cryptoToken.allowance(owner.address, addr1.address)).to.equal(
        approveAmount.sub(transferAmount)
      );
    });
  });
});
