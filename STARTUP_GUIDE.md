# 🚀 CryptoToken DApp Startup Guide

## One-Command Startup

### Start Everything:
```bash
npm start
```

That's it! This single command does everything for you:

1. ✅ Starts Hardhat blockchain node (localhost:8545)
2. ✅ Deploys your smart contract automatically  
3. ✅ Updates frontend configuration with contract address
4. ✅ Launches React frontend (localhost:3000)
5. ✅ Opens your browser automatically

## What You'll See

### Terminal Output:
```
🚀 Starting CryptoToken DApp...
📡 Starting Hardhat local blockchain...
✅ Blockchain node is ready!
📄 Deploying smart contract...
✅ Contract deployed successfully!
✅ Frontend configuration updated!
🎨 Starting React frontend...
✅ Frontend is ready!

🎉 APPLICATION IS FULLY RUNNING!
📱 Open your browser: http://localhost:3000
```

### Available Features:
- 🔐 **Authentication** - Login/Signup with email  
- 🔗 **Wallet Connection** - Connect MetaMask
- 💰 **Token Operations** - Transfer, Mint, Burn tokens
- 🎮 **Gambling Games**:
  - 🎲 **Dice Game** - Bet on dice rolls (1-6) with 5x payout
  - 🪙 **Coin Flip** - Bet on heads/tails with 2x payout  
  - 🎯 **Roulette** - Bet on numbers/colors with up to 36x payout

## MetaMask Setup (Automatic Instructions)

When you start the app, you'll get these details:

### Add Hardhat Network to MetaMask:
- **Network Name:** Hardhat Local
- **RPC URL:** http://127.0.0.1:8545
- **Chain ID:** 31337
- **Currency:** ETH

### Import Test Account:
- **Private Key:** `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
- **Balance:** 10,000 ETH + 100,000,000 CRYPTO tokens
- **Can mint more tokens** (you're the contract owner!)

## Alternative Commands

If `npm start` doesn't work, try these alternatives:

```bash
# Alternative startup commands (all do the same thing)
npm run app
npm run run

# Check if everything is ready first
npm run check

# Manual step-by-step (if you prefer)
npm run node          # Start blockchain (terminal 1)
npm run deploy:local  # Deploy contract (terminal 2)  
npm run frontend      # Start frontend (terminal 3)
```

## Troubleshooting

### Port Already in Use:
If you get port errors:
```bash
# Kill processes on ports 8545 and 3000
lsof -ti:8545 | xargs kill -9
lsof -ti:3000 | xargs kill -9
npm start
```

### Missing Dependencies:
```bash
# Root dependencies
npm install

# Frontend dependencies  
cd frontend && npm install && cd ..

# Try again
npm start
```

### Check Setup:
```bash
npm run check
```

## Stopping the Application

Press **Ctrl+C** in the terminal running `npm start` to stop all services gracefully.

## Development vs Production

- **Development:** Uses Hardhat local blockchain (this setup)
- **Production:** Deploy to real networks (Sepolia, Mainnet) using other scripts

---

**🎉 Enjoy your full-stack DApp with gambling games!**
