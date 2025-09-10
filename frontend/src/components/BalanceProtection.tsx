import React from 'react';
import { ethers } from 'ethers';
import { TokenInfo } from '../types';
import DepositSystem from './DepositSystem';

interface BalanceProtectionProps {
  tokenInfo: TokenInfo | null;
  minTokensRequired: number;
  children: React.ReactNode;
  onDepositSuccess: () => void;
}

const BalanceProtection: React.FC<BalanceProtectionProps> = ({
  tokenInfo,
  minTokensRequired,
  children,
  onDepositSuccess
}) => {
  const hasInsufficientBalance = () => {
    if (!tokenInfo) return true;
    
    const balance = parseFloat(ethers.utils.formatUnits(tokenInfo.balance, tokenInfo.decimals));
    return balance < minTokensRequired;
  };

  if (hasInsufficientBalance()) {
    return (
      <div className="balance-protection">
        <div className="insufficient-balance-warning">
          <div className="warning-icon">⚠️</div>
          <h3>Insufficient Balance</h3>
          <p>You need at least <strong>{minTokensRequired.toLocaleString()} LUXE tokens</strong> to play games.</p>
          
          {tokenInfo && (
            <p>Your current balance: <strong>
              {parseFloat(ethers.utils.formatUnits(tokenInfo.balance, tokenInfo.decimals)).toFixed(2)} LUXE
            </strong></p>
          )}
          
          <div className="deposit-suggestion">
            <p>💡 <strong>Get tokens by:</strong></p>
            <ul>
              <li>🔄 Depositing Solana or Bitcoin</li>
              <li>💰 Purchasing with Ethereum</li>
              <li>🎁 Receiving from other players</li>
            </ul>
          </div>
        </div>

        <div className="deposit-section">
          <DepositSystem onDeposit={onDepositSuccess} />
        </div>

        <div className="alternative-actions">
          <div className="action-card">
            <h4>📈 Buy with ETH</h4>
            <p>Convert your Ethereum to LUXE tokens instantly</p>
            <button className="action-btn primary">
              Buy Tokens
            </button>
          </div>
          
          <div className="action-card">
            <h4>🎁 Get Free Tokens</h4>
            <p>Complete tasks or invite friends for bonus tokens</p>
            <button className="action-btn secondary">
              Earn Tokens
            </button>
          </div>
        </div>

        <div className="balance-info">
          <div className="info-card">
            <h4>🎮 About LUXE Tokens</h4>
            <div className="token-uses">
              <div className="use-item">
                <span className="icon">🎲</span>
                <span>Play dice games (min 1 token)</span>
              </div>
              <div className="use-item">
                <span className="icon">🪙</span>
                <span>Bet on coin flips (min 1 token)</span>
              </div>
              <div className="use-item">
                <span className="icon">🎯</span>
                <span>Spin the roulette (min 1 token)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default BalanceProtection;
