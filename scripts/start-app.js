const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting CryptoToken DApp...');
console.log('=====================================');

let nodeProcess = null;
let deploymentComplete = false;

// Function to start Hardhat node
function startHardhatNode() {
  return new Promise((resolve) => {
    console.log('📡 Starting Hardhat local blockchain...');
    nodeProcess = spawn('npx', ['hardhat', 'node'], {
      stdio: ['pipe', 'pipe', 'pipe'],
      cwd: process.cwd()
    });

    nodeProcess.stdout.on('data', (data) => {
      const output = data.toString();
      if (output.includes('Started HTTP and WebSocket JSON-RPC server')) {
        console.log('✅ Blockchain node is ready!');
        resolve();
      }
    });

    nodeProcess.stderr.on('data', (data) => {
      // Suppress some verbose output but show errors
      const output = data.toString();
      if (output.includes('ERROR') || output.includes('Error')) {
        console.error('❌ Blockchain error:', output);
      }
    });

    // Give it some time to start
    setTimeout(resolve, 3000);
  });
}

// Function to deploy contract
function deployContract() {
  return new Promise((resolve, reject) => {
    console.log('📄 Deploying smart contract...');
    
    const deployProcess = spawn('npx', ['hardhat', 'run', 'scripts/deploy-and-update.js', '--network', 'localhost'], {
      stdio: ['pipe', 'pipe', 'pipe'],
      cwd: process.cwd()
    });

    deployProcess.stdout.on('data', (data) => {
      const output = data.toString();
      if (output.includes('deployed to:')) {
        console.log('✅ Contract deployed successfully!');
      }
      if (output.includes('Frontend configuration updated')) {
        console.log('✅ Frontend configuration updated!');
      }
    });

    deployProcess.stderr.on('data', (data) => {
      console.error('Deployment error:', data.toString());
    });

    deployProcess.on('close', (code) => {
      if (code === 0) {
        deploymentComplete = true;
        console.log('✅ Deployment completed!');
        resolve();
      } else {
        reject(new Error(`Deployment failed with code ${code}`));
      }
    });
  });
}

// Function to start frontend
function startFrontend() {
  return new Promise((resolve) => {
    console.log('🎨 Starting React frontend...');
    
    const frontendProcess = spawn('npm', ['start'], {
      stdio: ['pipe', 'pipe', 'pipe'],
      cwd: path.join(process.cwd(), 'frontend')
    });

    frontendProcess.stdout.on('data', (data) => {
      const output = data.toString();
      if (output.includes('webpack compiled') || output.includes('compiled successfully') || output.includes('Local:')) {
        console.log('✅ Frontend is ready!');
        console.log('');
        console.log('🎉 APPLICATION IS FULLY RUNNING!');
        console.log('================================');
        console.log('');
        console.log('📱 Open your browser: http://localhost:3000');
        console.log('🎮 Available Features:');
        console.log('   • Login/Signup with email');
        console.log('   • Connect MetaMask wallet');
        console.log('   • Transfer, Mint, Burn tokens');
        console.log('   • Play gambling games: Dice 🎲, Coin Flip 🪙, Roulette 🎯');
        console.log('');
        console.log('🔧 MetaMask Setup:');
        console.log('   Network: Hardhat Local');
        console.log('   RPC URL: http://127.0.0.1:8545');
        console.log('   Chain ID: 31337');
        console.log('   Currency: ETH');
        console.log('');
        console.log('🔐 Import Test Account to MetaMask:');
        console.log('   Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80');
        console.log('');
        console.log('💡 This account owns 100,000,000 CRYPTO tokens and can mint more!');
        console.log('');
        console.log('🛑 Press Ctrl+C to stop all services');
        resolve();
      }
    });

    frontendProcess.stderr.on('data', (data) => {
      // Suppress most frontend warnings/info
      const output = data.toString();
      if (output.includes('ERROR') || output.includes('Error')) {
        console.error('Frontend error:', output);
      }
    });

    // Attach to our main process so it gets killed when we exit
    process.frontendProcess = frontendProcess;
  });
}

// Main startup sequence
async function startApp() {
  try {
    // Step 1: Start blockchain node
    await startHardhatNode();
    
    // Step 2: Deploy contract
    await deployContract();
    
    // Step 3: Start frontend
    await startFrontend();
    
  } catch (error) {
    console.error('❌ Startup failed:', error.message);
    process.exit(1);
  }
}

// Handle shutdown gracefully
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down...');
  
  if (nodeProcess) {
    nodeProcess.kill('SIGTERM');
  }
  
  if (process.frontendProcess) {
    process.frontendProcess.kill('SIGTERM');
  }
  
  console.log('✅ All services stopped');
  process.exit(0);
});

// Start the application
startApp();
