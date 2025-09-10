import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { ethers } from 'ethers';
import { useAuth } from '../../contexts/AuthContext';

interface SignupFormData {
  email: string;
  confirmEmail: string;
  acceptTerms: boolean;
}

interface SignupFormProps {
  onSwitchToLogin: () => void;
}

const SignupForm: React.FC<SignupFormProps> = ({ onSwitchToLogin }) => {
  const { signup, isLoading, error, clearError } = useAuth();
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>('');
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    getValues,
  } = useForm<SignupFormData>();

  const email = watch('email');
  const confirmEmail = watch('confirmEmail');
  const acceptTerms = watch('acceptTerms');

  // Connect to MetaMask
  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('MetaMask is required to use this application. Please install MetaMask and refresh the page.');
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
        throw new Error('No accounts found. Please make sure MetaMask is unlocked.');
      }

      setWalletAddress(accounts[0]);
    } catch (err: any) {
      console.error('Error connecting wallet:', err);
      alert(err.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  // Sign message and create account
  const onSubmit = async (data: SignupFormData) => {
    if (!walletAddress) {
      alert('Please connect your MetaMask wallet first');
      return;
    }

    try {
      clearError();
      
      // Create provider and signer
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      // Message to sign for account creation
      const message = `Welcome to CryptoToken DApp!

Sign this message to create your account.

Email: ${data.email}
Wallet: ${walletAddress}
Timestamp: ${new Date().toISOString()}

By signing this message, you agree to our terms of service and confirm ownership of this wallet.`;

      // Request signature
      const signature = await signer.signMessage(message);

      // Create account
      await signup({
        email: data.email,
        walletAddress,
        signature,
      });

    } catch (err: any) {
      console.error('Signup error:', err);
      // Error is handled by the auth context
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const isFormValid = email && confirmEmail && acceptTerms && walletAddress && email === confirmEmail;

  return (
    <div className="auth-form">
      <div className="auth-card">
        <h2>Create Account</h2>
        <p>Join CryptoToken DApp and start managing your tokens</p>

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
            <label>Confirm Email Address</label>
            <input
              type="email"
              {...register('confirmEmail', {
                required: 'Please confirm your email',
                validate: (value) => {
                  const { email } = getValues();
                  return email === value || 'Email addresses do not match';
                },
              })}
              placeholder="Confirm your email"
              disabled={isLoading}
            />
            {errors.confirmEmail && (
              <span className="error-text">{errors.confirmEmail.message}</span>
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
                  <span className="wallet-status">✅ Connected</span>
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

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                {...register('acceptTerms', {
                  required: 'You must accept the terms of service',
                })}
                disabled={isLoading}
              />
              <span className="checkmark"></span>
              I agree to the Terms of Service and Privacy Policy
            </label>
            {errors.acceptTerms && (
              <span className="error-text">{errors.acceptTerms.message}</span>
            )}
          </div>

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={isLoading || !isFormValid}
          >
            {isLoading ? 'Creating Account...' : 'Create Account with MetaMask'}
          </button>
        </form>

        <div className="auth-switch">
          <p>Already have an account?</p>
          <button 
            type="button" 
            className="switch-btn" 
            onClick={onSwitchToLogin}
            disabled={isLoading}
          >
            Sign In
          </button>
        </div>

        <div className="auth-info">
          <h4>Why do we need this?</h4>
          <ul>
            <li><strong>Email:</strong> For account recovery and notifications</li>
            <li><strong>MetaMask:</strong> To securely verify wallet ownership</li>
            <li><strong>Signature:</strong> Proves you own the connected wallet</li>
            <li><strong>No password:</strong> Your MetaMask wallet is your login</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SignupForm;
