# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a full-stack blockchain/cryptocurrency project built with Hardhat for smart contract development. The project structure includes:

- **Smart contracts** (Solidity) - Located in `contracts/`
- **Frontend application** - Located in `frontend/` with React/TypeScript structure
- **Deployment scripts** - Located in `scripts/`
- **Smart contract tests** - Located in `test/`
- **Security audits** - Located in `audit/`
- **Documentation** - Located in `docs/`

## Architecture

### Smart Contract Layer
- Uses Hardhat framework for development, testing, and deployment
- Dependencies include OpenZeppelin contracts and Chainlink oracles
- Smart contracts will be written in Solidity and stored in `contracts/`

### Frontend Layer
- React-based frontend with TypeScript support
- Structured with standard React patterns:
  - `frontend/src/components/` - Reusable UI components
  - `frontend/src/pages/` - Page-level components
  - `frontend/src/hooks/` - Custom React hooks
  - `frontend/src/utils/` - Utility functions
  - `frontend/src/types/` - TypeScript type definitions

## Development Commands

### Initial Setup
```bash
# Initialize Hardhat project (if not already done)
npx hardhat init

# Install dependencies
npm install
```

### Smart Contract Development
```bash
# Compile smart contracts
npx hardhat compile

# Run smart contract tests
npx hardhat test

# Run tests with gas reporting
npx hardhat test --gas-report

# Run a specific test file
npx hardhat test test/YourContract.js

# Deploy to local network
npx hardhat node
npx hardhat run scripts/deploy.js --network localhost

# Deploy to testnet (requires network configuration)
npx hardhat run scripts/deploy.js --network goerli
npx hardhat run scripts/deploy.js --network sepolia
```

### Development and Testing
```bash
# Start local blockchain node
npx hardhat node

# Open Hardhat console
npx hardhat console

# Run deployment scripts
npx hardhat run scripts/deploy.js

# Verify contracts on Etherscan (requires API key)
npx hardhat verify --network mainnet CONTRACT_ADDRESS "constructor_arg1" "constructor_arg2"
```

### Code Quality
```bash
# Lint Solidity contracts (requires solhint)
npx solhint 'contracts/**/*.sol'

# Run security analysis with Slither (requires installation)
slither .

# Format code with Prettier (requires configuration)
npx prettier --write 'contracts/**/*.sol'
npx prettier --write 'test/**/*.js'
```

## Key Dependencies

- **@nomicfoundation/hardhat-toolbox**: Complete Hardhat development environment
- **@openzeppelin/contracts**: Secure smart contract library with standard implementations
- **@chainlink/contracts**: Oracle integration for external data feeds
- **hardhat**: Core Ethereum development framework

## Network Configuration

When setting up networks in `hardhat.config.js`, typically include:
- **hardhat**: Local development network (built-in)
- **localhost**: Local node (port 8545)
- **sepolia**: Ethereum testnet
- **goerli**: Ethereum testnet (being deprecated)
- **mainnet**: Ethereum mainnet (production)

## Testing Strategy

- Unit tests for individual contract functions
- Integration tests for contract interactions
- Gas optimization testing
- Security-focused edge case testing
- Frontend integration testing with local blockchain

## Security Considerations

- All contracts should undergo security review before deployment
- Use OpenZeppelin's tested contract implementations when possible
- Store audit reports in `audit/` directory
- Never commit private keys or sensitive environment variables
- Use environment variables for network configurations and API keys

## Frontend Integration

The frontend structure suggests integration with:
- Web3 wallet connections (MetaMask, WalletConnect)
- Contract interaction through ethers.js or web3.js
- Real-time blockchain state updates
- Transaction status monitoring

## Environment Setup

Create a `.env` file in the root directory with:
```
PRIVATE_KEY=your_private_key_here
INFURA_API_KEY=your_infura_key_here
ETHERSCAN_API_KEY=your_etherscan_key_here
```

## Common Workflow

1. Write smart contracts in `contracts/`
2. Create deployment scripts in `scripts/`
3. Write comprehensive tests in `test/`
4. Deploy and test on local network
5. Deploy to testnet for integration testing
6. Security audit and review
7. Deploy to mainnet
8. Build and deploy frontend with contract addresses
