import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { ethers } from 'ethers';
import { useAuth } from '../../contexts/AuthContext';

interface LoginFormData {
  email: string;
}

interface LoginFormProps {
  onSwitchToSignup: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToSignup }) => {
  const { login, isLoading, error, clearError } = useAuth();
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>('');
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<LoginFormData>();

  const email = watch('email');

  // Connect to MetaMask
  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('MetaMask is required to use this application');
      return;
    }

    try {
      setIsConnecting(true);
      clearError();

      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      setWalletAddress(accounts[0]);
    } catch (err: any) {
      console.error('Error connecting wallet:', err);
      alert(err.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  // Sign message and login
  const onSubmit = async (data: LoginFormData) => {
    if (!walletAddress) {
      alert('Please connect your MetaMask wallet first');
      return;
    }

    try {
      clearError();
      
      // Create provider and signer
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      // Message to sign for authentication
      const message = `Sign this message to log in to CryptoToken DApp.\n\nEmail: ${data.email}\nWallet: ${walletAddress}\nTimestamp: ${new Date().toISOString()}`;

      // Request signature
      const signature = await signer.signMessage(message);

      // Attempt login
      await login({
        email: data.email,
        walletAddress,
        signature,
      });

    } catch (err: any) {
      console.error('Login error:', err);
      // Error is handled by the auth context
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="auth-form">
      <div className="auth-card">
        <h2>Welcome Back!</h2>
        <p>Sign in to access your CryptoToken dashboard</p>

        {error && (
          <div className="error-message">
            <p>{error}</p>
            <button onClick={clearError} className="clear-error-btn">×</button>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              })}
              placeholder="Enter your email"
              disabled={isLoading}
            />
            {errors.email && (
              <span className="error-text">{errors.email.message}</span>
            )}
          </div>

          <div className="form-group">
            <label>MetaMask Wallet</label>
            {!walletAddress ? (
              <button
                type="button"
                className="wallet-connect-btn"
                onClick={connectWallet}
                disabled={isConnecting || isLoading}
              >
                {isConnecting ? 'Connecting...' : 'Connect MetaMask Wallet'}
              </button>
            ) : (
              <div className="wallet-connected">
                <div className="wallet-info">
                  <span className="wallet-icon">🔗</span>
                  <span className="wallet-address">{formatAddress(walletAddress)}</span>
                </div>
                <button
                  type="button"
                  className="wallet-disconnect-btn"
                  onClick={() => setWalletAddress('')}
                  disabled={isLoading}
                >
                  Disconnect
                </button>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={isLoading || !email || !walletAddress}
          >
            {isLoading ? 'Signing In...' : 'Sign In with MetaMask'}
          </button>
        </form>

        <div className="auth-switch">
          <p>Don't have an account?</p>
          <button 
            type="button" 
            className="switch-btn" 
            onClick={onSwitchToSignup}
            disabled={isLoading}
          >
            Create Account
          </button>
        </div>

        <div className="auth-info">
          <h4>How it works:</h4>
          <ul>
            <li>Enter your email address</li>
            <li>Connect your MetaMask wallet</li>
            <li>Sign a message to verify ownership</li>
            <li>Access your token dashboard</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
