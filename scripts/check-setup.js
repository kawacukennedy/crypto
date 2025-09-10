const fs = require('fs');
const path = require('path');

console.log('🔍 Pre-flight checks for CryptoToken DApp...');
console.log('=============================================');

let allGood = true;

// Check if node_modules exist in root
if (fs.existsSync(path.join(__dirname, '../node_modules'))) {
  console.log('✅ Root dependencies installed');
} else {
  console.log('❌ Root dependencies missing - run: npm install');
  allGood = false;
}

// Check if frontend node_modules exist
if (fs.existsSync(path.join(__dirname, '../frontend/node_modules'))) {
  console.log('✅ Frontend dependencies installed');
} else {
  console.log('❌ Frontend dependencies missing - run: cd frontend && npm install');
  allGood = false;
}

// Check if contracts are compiled
if (fs.existsSync(path.join(__dirname, '../artifacts'))) {
  console.log('✅ Smart contracts compiled');
} else {
  console.log('⚠️  Smart contracts not compiled yet (will be compiled on start)');
}

// Check if .env exists
if (fs.existsSync(path.join(__dirname, '../.env'))) {
  console.log('✅ Environment file exists');
} else {
  console.log('⚠️  .env file missing (optional - will use defaults)');
}

// Check frontend config
if (fs.existsSync(path.join(__dirname, '../frontend/src/utils/contracts.ts'))) {
  console.log('✅ Frontend contract configuration exists');
} else {
  console.log('❌ Frontend contract configuration missing');
  allGood = false;
}

console.log('');
if (allGood) {
  console.log('🎉 Everything looks good!');
  console.log('');
  console.log('🚀 Ready to start? Run:');
  console.log('   npm start');
} else {
  console.log('❌ Please fix the issues above before starting');
  console.log('');
  console.log('💡 Quick fix commands:');
  console.log('   npm install');
  console.log('   cd frontend && npm install');
  console.log('   cd .. && npm start');
}

console.log('');
