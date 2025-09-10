import React, { useState } from 'react';
import { ethers } from 'ethers';
import { WalletState } from '../types';
import { useCryptoToken } from '../hooks/useCryptoToken';
import { getNetworkConfig } from '../utils/contracts';
import BatchTransfer from './BatchTransfer';
import DiceGame from './games/DiceGame';
import CoinFlipGame from './games/CoinFlipGame';
import RouletteGame from './games/RouletteGame';

interface TokenDashboardProps {
  wallet: WalletState;
  onDisconnect: () => void;
}

const TokenDashboard: React.FC<TokenDashboardProps> = ({ wallet, onDisconnect }) => {
  const {
    tokenInfo,
    transactionState,
    isOwner,
    transfer,
    mint,
    burn,
    clearTransactionState
  } = useCryptoToken(wallet);

  const [transferTo, setTransferTo] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [mintTo, setMintTo] = useState('');
  const [mintAmount, setMintAmount] = useState('');
  const [burnAmount, setBurnAmount] = useState('');
  const [activeTab, setActiveTab] = useState<'transfer' | 'mint' | 'burn' | 'batch' | 'dice' | 'coinflip' | 'roulette'>('transfer');

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getNetworkName = (chainId: number | null) => {
    if (!chainId) return 'Unknown';
    const config = getNetworkConfig(chainId);
    return config?.name || `Chain ${chainId}`;
  };

  const formatTokenAmount = (amount: ethers.BigNumber | undefined, decimals: number) => {
    if (!amount) return '0';
    return ethers.utils.formatUnits(amount, decimals);
  };

  // Clear any previous transaction states when component mounts
  React.useEffect(() => {
    clearTransactionState();
  }, [clearTransactionState]);

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferTo || !transferAmount) return;

    try {
      await transfer(transferTo, transferAmount);
      setTransferTo('');
      setTransferAmount('');
    } catch (err: any) {
      console.error('Transfer failed:', err);
    }
  };

  const handleMint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mintTo || !mintAmount) return;

    try {
      await mint(mintTo, mintAmount);
      setMintTo('');
      setMintAmount('');
    } catch (err: any) {
      console.error('Mint failed:', err);
    }
  };

  const handleBurn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!burnAmount) return;

    try {
      await burn(burnAmount);
      setBurnAmount('');
    } catch (err: any) {
      console.error('Burn failed:', err);
    }
  };

  return (
    <div className="token-dashboard">
      <div className="dashboard-header">
        <div className="wallet-info">
          <h2>Wallet Connected</h2>
          <p>Address: {wallet.address ? formatAddress(wallet.address) : 'N/A'}</p>
          <p>Network: {getNetworkName(wallet.chainId)}</p>
          <button className="disconnect-btn" onClick={onDisconnect}>
            Disconnect
          </button>
        </div>
      </div>

      {tokenInfo ? (
        <div className="token-info">
          <h3>{tokenInfo.name} ({tokenInfo.symbol})</h3>
          <div className="token-stats">
            <div className="stat">
              <label>Your Balance:</label>
              <span>{formatTokenAmount(tokenInfo.balance, tokenInfo.decimals)} {tokenInfo.symbol}</span>
            </div>
            <div className="stat">
              <label>Total Supply:</label>
              <span>{formatTokenAmount(tokenInfo.totalSupply, tokenInfo.decimals)} {tokenInfo.symbol}</span>
            </div>
            {isOwner && (
              <div className="stat">
                <label>Status:</label>
                <span className="owner-badge">Contract Owner</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="token-info">
          <div className="loading-message">
            <p>Loading token information...</p>
            <p className="no-contract-warning">
              No contract deployed on this network or contract address not configured.
            </p>
          </div>
        </div>
      )}

      {tokenInfo && (
        <div className="actions-section">
          <div className="tabs">
            <button 
              className={activeTab === 'transfer' ? 'tab active' : 'tab'}
              onClick={() => setActiveTab('transfer')}
            >
              Transfer
            </button>
            {isOwner && (
              <button 
                className={activeTab === 'mint' ? 'tab active' : 'tab'}
                onClick={() => setActiveTab('mint')}
              >
                Mint
              </button>
            )}
            <button 
              className={activeTab === 'burn' ? 'tab active' : 'tab'}
              onClick={() => setActiveTab('burn')}
            >
              Burn
            </button>
            <button 
              className={activeTab === 'batch' ? 'tab active' : 'tab'}
              onClick={() => setActiveTab('batch')}
            >
              Batch Transfer
            </button>
            <button 
              className={activeTab === 'dice' ? 'tab active' : 'tab'}
              onClick={() => setActiveTab('dice')}
            >
              🎲 Dice
            </button>
            <button 
              className={activeTab === 'coinflip' ? 'tab active' : 'tab'}
              onClick={() => setActiveTab('coinflip')}
            >
              🪙 Coin Flip
            </button>
            <button 
              className={activeTab === 'roulette' ? 'tab active' : 'tab'}
              onClick={() => setActiveTab('roulette')}
            >
              🎯 Roulette
            </button>
          </div>

          {activeTab === 'transfer' && (
            <div className="tab-content">
              <h3>Transfer Tokens</h3>
              <form onSubmit={handleTransfer}>
                <div className="form-group">
                  <label>Recipient Address:</label>
                  <input
                    type="text"
                    value={transferTo}
                    onChange={(e) => setTransferTo(e.target.value)}
                    placeholder="0x..."
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Amount:</label>
                  <input
                    type="number"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    placeholder="0.0"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
                <button type="submit" disabled={transactionState.loading || !transferTo || !transferAmount}>
                  {transactionState.loading ? 'Sending...' : 'Send Tokens'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'mint' && isOwner && (
            <div className="tab-content">
              <h3>Mint Tokens (Owner Only)</h3>
              <form onSubmit={handleMint}>
                <div className="form-group">
                  <label>Recipient Address:</label>
                  <input
                    type="text"
                    value={mintTo}
                    onChange={(e) => setMintTo(e.target.value)}
                    placeholder="0x..."
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Amount to Mint:</label>
                  <input
                    type="number"
                    value={mintAmount}
                    onChange={(e) => setMintAmount(e.target.value)}
                    placeholder="0.0"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
                <button type="submit" disabled={transactionState.loading || !mintTo || !mintAmount}>
                  {transactionState.loading ? 'Minting...' : 'Mint Tokens'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'burn' && (
            <div className="tab-content">
              <h3>Burn Tokens</h3>
              <form onSubmit={handleBurn}>
                <div className="form-group">
                  <label>Amount to Burn:</label>
                  <input
                    type="number"
                    value={burnAmount}
                    onChange={(e) => setBurnAmount(e.target.value)}
                    placeholder="0.0"
                    step="0.01"
                    min="0"
                    max={tokenInfo ? formatTokenAmount(tokenInfo.balance, tokenInfo.decimals) : '0'}
                    required
                  />
                </div>
                <button type="submit" disabled={transactionState.loading || !burnAmount}>
                  {transactionState.loading ? 'Burning...' : 'Burn Tokens'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'batch' && (
            <div className="tab-content">
              <BatchTransfer wallet={wallet} />
            </div>
          )}

          {activeTab === 'dice' && (
            <div className="tab-content">
              <DiceGame wallet={wallet} />
            </div>
          )}

          {activeTab === 'coinflip' && (
            <div className="tab-content">
              <CoinFlipGame wallet={wallet} />
            </div>
          )}

          {activeTab === 'roulette' && (
            <div className="tab-content">
              <RouletteGame wallet={wallet} />
            </div>
          )}
        </div>
      )}

      {transactionState.error && (
        <div className="error-message">
          <p>{transactionState.error}</p>
          <button onClick={clearTransactionState} className="clear-btn">Clear</button>
        </div>
      )}

      {transactionState.hash && (
        <div className="success-message">
          <p>Transaction {transactionState.success ? 'completed' : 'sent'}!</p>
          <p>Hash: {formatAddress(transactionState.hash)}</p>
          {wallet.chainId && getNetworkConfig(wallet.chainId)?.blockExplorer && (
            <a 
              href={`${getNetworkConfig(wallet.chainId)?.blockExplorer}/tx/${transactionState.hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="explorer-link"
            >
              View on Explorer
            </a>
          )}
          <button onClick={clearTransactionState} className="clear-btn">Clear</button>
        </div>
      )}
    </div>
  );
};

export default TokenDashboard;
