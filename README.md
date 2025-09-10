# CryptoToken - Full-Stack Blockchain Project

A complete full-stack blockchain application featuring an ERC20 token smart contract with a React frontend for interaction.

## 🚀 Features

### Smart Contract (CryptoToken)
- **ERC20 Standard**: Fully compliant ERC20 token implementation
- **Burnable**: Token holders can burn their tokens to reduce supply
- **Mintable**: Owner can mint new tokens (within max supply limit)
- **Batch Transfer**: Transfer tokens to multiple addresses in one transaction
- **Owner Controls**: Administrative functions for token management
- **Security**: Built with OpenZeppelin's audited contracts

### Frontend DApp
- **Wallet Integration**: Connect with MetaMask
- **Token Dashboard**: View balance and token information
- **Transfer Interface**: Send tokens to other addresses
- **Network Support**: Works on multiple Ethereum networks
- **Responsive Design**: Mobile-friendly interface

## 📁 Project Structure

```
crypto/
├── contracts/              # Solidity smart contracts
│   └── CryptoToken.sol     # Main ERC20 token contract
├── scripts/                # Deployment scripts
│   └── deploy.js          # Contract deployment script
├── test/                   # Smart contract tests
│   └── CryptoToken.test.js # Comprehensive test suite
├── frontend/               # React frontend application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── types/          # TypeScript type definitions
│   │   └── utils/          # Utility functions
│   └── public/            # Static assets
├── hardhat.config.js      # Hardhat configuration
├── package.json           # Node.js dependencies and scripts
└── .env.example          # Environment variables template
```

## 🛠 Setup and Installation

### Prerequisites
- Node.js v16 or higher
- npm or yarn
- MetaMask browser extension
- Git

### Clone and Install
```bash
# Clone the repository
git clone <repository-url>
cd crypto

# Install dependencies
npm install

# Copy environment template
cp .env.example .env
```

### Configure Environment
Edit `.env` file with your values:
```
PRIVATE_KEY=your_private_key_here
INFURA_API_KEY=your_infura_api_key_here
ETHERSCAN_API_KEY=your_etherscan_api_key_here
```

## Quick Start

### 🚀 Run the entire application with ONE command:

```bash
npm start
```

**Optional: Check if everything is ready first:**
```bash
npm run check
```

This single command will:
1. Start the Hardhat blockchain node
2. Deploy the smart contract
3. Update frontend configuration automatically
4. Launch the React frontend
5. Open your browser to http://localhost:3000

**That's it! Your full-stack DApp is running!**

### 🎮 What you get:
- **Authentication system** - Login/Signup with email
- **Web3 wallet integration** - Connect MetaMask 
- **Token operations** - Transfer, Mint, Burn tokens
- **Gambling games** - Play Dice 🎲, Coin Flip 🪙, and Roulette 🎯
- **Real blockchain transactions** - All on local testnet

### 🔧 MetaMask Setup (automated instructions will appear):
- Network: Hardhat Local
- RPC URL: http://127.0.0.1:8545
- Chain ID: 31337
- Import test account with 100M tokens

---

## Development Commands

### 🚀 One-Command Start (Super Easy!)
```bash
npm start
```
**That's it!** This single command will:
- Start the local blockchain
- Deploy the smart contract  
- Update frontend configuration automatically
- Launch the React app at http://localhost:3000

### Alternative: Manual Steps
```bash
# Start local blockchain node
npm run node

# In a new terminal, deploy contract and start frontend
npm run deploy-and-start
```

### Smart Contract Development
```bash
# Compile contracts
npm run compile

# Run tests
npm test

# Run tests with gas reporting
npm run test:gas

# Start local blockchain
npm run node

# Deploy to local network
npm run deploy:local

# Deploy and update frontend automatically
npx hardhat run scripts/deploy-and-update.js --network localhost

# Test contract interactions
npx hardhat run scripts/test-interactions.js --network localhost

# Deploy to Sepolia testnet
npm run deploy:sepolia

# Verify contract on Etherscan
npm run verify:sepolia <CONTRACT_ADDRESS> "CryptoToken" "CRYPTO" 18 "100000000000000000000000000"
```

### Frontend Development
```bash
# Install frontend dependencies
npm run frontend:install

# Start frontend development server
npm run frontend

# Build frontend for production
npm run frontend:build
```

## 🧪 Testing

The project includes comprehensive tests covering:

- **Deployment**: Correct initialization and owner setup
- **Transfers**: Token transfers between accounts
- **Minting**: Owner-only minting functionality
- **Burning**: Token burning and burn-from capabilities
- **Batch Operations**: Multiple token transfers
- **Access Control**: Owner permissions and restrictions
- **Edge Cases**: Error conditions and boundary testing

Run tests with:
```bash
npm test
```

## 🌐 Deployment

### Local Development

**Option 1: One Command (Recommended)**
```bash
npm start
```

**Option 2: Manual Steps**
```bash
# Terminal 1: Start Hardhat node
npm run node

# Terminal 2: Deploy contract and update frontend config
npx hardhat run scripts/deploy-and-update.js --network localhost

# Start frontend
npm run frontend
```

### MetaMask Setup for Local Development
1. Add Hardhat Local Network to MetaMask:
   - Network Name: Hardhat Local
   - RPC URL: http://127.0.0.1:8545
   - Chain ID: 31337
   - Currency: ETH

2. Import test account (has 10,000 ETH):
   - Private Key: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
   - This is the contract owner account

3. Visit http://localhost:3000 and connect MetaMask

### Using the DApp
The fully functional DApp includes:
- **Transfer**: Send tokens to other addresses
- **Mint** (Owner only): Create new tokens
- **Burn**: Destroy tokens permanently
- **Batch Transfer**: Send tokens to multiple addresses in one transaction
- Real-time balance updates
- Transaction status tracking
- Network detection

### Testnet Deployment
1. Fund your wallet with testnet ETH from faucets
2. Update `.env` with your private key and API keys
3. Deploy to Sepolia: `npm run deploy:sepolia`
4. The contract address will be automatically updated in frontend config
5. Start frontend: `npm run frontend`

### Mainnet Deployment
1. Fund your wallet with ETH for gas fees
2. Deploy to mainnet: `npm run deploy:mainnet`
3. Verify contract: `npm run verify:mainnet <CONTRACT_ADDRESS>`
4. Contract address will be automatically updated
5. Build and deploy frontend to hosting service: `npm run frontend:build`

## 🔒 Security Considerations

- Never commit private keys or sensitive data
- Use environment variables for configuration
- Verify all contracts before mainnet deployment
- Conduct thorough testing on testnets
- Consider professional security audits for mainnet deployment

## 📝 Contract Specifications

### CryptoToken Contract
- **Name**: CryptoToken
- **Symbol**: CRYPTO
- **Decimals**: 18
- **Initial Supply**: 100,000,000 tokens
- **Max Supply**: 1,000,000,000 tokens
- **Features**: Mintable, Burnable, Batch Transfer

### Key Functions
- `transfer(to, amount)`: Transfer tokens
- `mint(to, amount)`: Mint new tokens (owner only)
- `burn(amount)`: Burn tokens
- `batchTransfer(recipients, amounts)`: Batch transfer
- `approve(spender, amount)`: Approve spending

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Resources

- [Hardhat Documentation](https://hardhat.org/docs/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [React Documentation](https://reactjs.org/docs/)
- [ethers.js Documentation](https://docs.ethers.io/)
- [MetaMask Documentation](https://docs.metamask.io/)

## 📞 Support

For questions and support, please open an issue in the repository or contact the development team.
