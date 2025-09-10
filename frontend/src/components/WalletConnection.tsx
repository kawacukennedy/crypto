import React from 'react';

interface WalletConnectionProps {
  onConnect: () => void;
  isLoading: boolean;
  error: string | null;
}

const WalletConnection: React.FC<WalletConnectionProps> = ({ onConnect, isLoading, error }) => {
  return (
    <div className="wallet-connection">
      <div className="connection-card">
        <h2>Connect Your Wallet</h2>
        <p>Connect your MetaMask wallet to start interacting with CryptoToken</p>
        
        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}
        
        <button 
          className="connect-button"
          onClick={onConnect}
          disabled={isLoading}
        >
          {isLoading ? 'Connecting...' : 'Connect MetaMask'}
        </button>
        
        <div className="connection-info">
          <h3>What you can do:</h3>
          <ul>
            <li>View your token balance</li>
            <li>Send tokens to other addresses</li>
            <li>Approve token allowances</li>
            <li>View transaction history</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default WalletConnection;
