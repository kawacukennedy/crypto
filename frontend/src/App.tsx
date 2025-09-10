import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AuthPage from './pages/AuthPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import TokenDashboard from './components/TokenDashboard';
import WalletConnection from './components/WalletConnection';
import { useWallet } from './hooks/useWallet';
import './App.css';

const AppContent: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { wallet, isLoading, error, isMetaMaskInstalled, connectWallet, disconnectWallet } = useWallet();

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return (
    <div className="App">
      <header className="App-header">
        <div className="header-content">
          <div className="header-left">
            <h1>CryptoToken DApp</h1>
            <p>Welcome back, {user?.email}</p>
          </div>
          <div className="header-right">
            <div className="user-info">
              <span className="user-wallet">
                🔗 {user?.walletAddress?.slice(0, 6)}...{user?.walletAddress?.slice(-4)}
              </span>
              <button className="logout-btn" onClick={logout}>
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <main className="App-main">
        {!isMetaMaskInstalled ? (
          <div className="metamask-warning">
            <h2>MetaMask Required</h2>
            <p>Please install MetaMask to use this application.</p>
            <a 
              href="https://metamask.io/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="install-metamask-btn"
            >
              Install MetaMask
            </a>
          </div>
        ) : !wallet.isConnected ? (
          <WalletConnection
            onConnect={connectWallet}
            isLoading={isLoading}
            error={error}
          />
        ) : (
          <TokenDashboard
            wallet={wallet}
            onDisconnect={disconnectWallet}
          />
        )}
      </main>
      
      <footer className="App-footer">
        <p>Built with React, TypeScript, and ethers.js</p>
      </footer>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <ProtectedRoute fallback={<AuthPage />}>
        <AppContent />
      </ProtectedRoute>
    </AuthProvider>
  );
}

export default App;
