import React, { useState } from 'react';
import LoginForm from '../components/auth/LoginForm';
import SignupForm from '../components/auth/SignupForm';

type AuthMode = 'login' | 'signup';

const AuthPage: React.FC = () => {
  const [authMode, setAuthMode] = useState<AuthMode>('login');

  const switchToLogin = () => setAuthMode('login');
  const switchToSignup = () => setAuthMode('signup');

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1>CryptoToken DApp</h1>
          <p>Secure blockchain token management</p>
        </div>

        <div className="auth-content">
          {authMode === 'login' ? (
            <LoginForm onSwitchToSignup={switchToSignup} />
          ) : (
            <SignupForm onSwitchToLogin={switchToLogin} />
          )}
        </div>

        <div className="auth-footer">
          <div className="auth-features">
            <h3>Why use CryptoToken DApp?</h3>
            <div className="feature-grid">
              <div className="feature-item">
                <span className="feature-icon">🔒</span>
                <h4>Secure</h4>
                <p>MetaMask wallet integration for maximum security</p>
              </div>
              <div className="feature-item">
                <span className="feature-icon">⚡</span>
                <h4>Fast</h4>
                <p>Lightning-fast token transfers and operations</p>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🌐</span>
                <h4>Decentralized</h4>
                <p>Built on Ethereum blockchain technology</p>
              </div>
              <div className="feature-item">
                <span className="feature-icon">📊</span>
                <h4>Transparent</h4>
                <p>All transactions are publicly verifiable</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
