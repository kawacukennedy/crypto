import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AuthPage from './pages/AuthPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import MainDashboard from './components/MainDashboard';
import { SolanaWalletProvider } from './contexts/SolanaWalletContext';
import './App.css';

const AppContent: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return (
    <div className="App">
      <header className="App-header">
        <div className="header-content">
          <div className="header-left">
            <div className="brand">
              <img src="/logo.svg" alt="LuxeGamble" className="brand-logo" />
              <h1>LuxeGamble</h1>
            </div>
            <p>Welcome back, {user?.email}</p>
          </div>
          <div className="header-right">
            <div className="user-info">
              {user?.walletAddress && (
                <span className="user-wallet">
                  🔗 {user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)}
                </span>
              )}
              <button className="logout-btn" onClick={logout}>
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <main className="App-main">
        <MainDashboard />
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
      <SolanaWalletProvider>
        <ProtectedRoute fallback={<AuthPage />}>
          <AppContent />
        </ProtectedRoute>
      </SolanaWalletProvider>
    </AuthProvider>
  );
}

export default App;
