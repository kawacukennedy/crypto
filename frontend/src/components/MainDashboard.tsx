import React, { useState } from 'react';
import { useWallet } from '../hooks/useWallet';
import WalletConnection from './WalletConnection';
import TokenDashboard from './TokenDashboard';
import DiceGame from './games/DiceGame';
import CoinFlipGame from './games/CoinFlipGame';
import RouletteGame from './games/RouletteGame';

interface MainDashboardProps {
  // No props needed as this handles wallet internally
}

type TabType = 'games' | 'wallet' | 'tokens';
type GameType = 'dice' | 'coinflip' | 'roulette';

const MainDashboard: React.FC<MainDashboardProps> = () => {
  const { wallet, isLoading, error, isMetaMaskInstalled, connectWallet, disconnectWallet } = useWallet();
  const [activeTab, setActiveTab] = useState<TabType>('games');
  const [activeGame, setActiveGame] = useState<GameType>('dice');

  const renderGamesSection = () => {
    if (!isMetaMaskInstalled) {
      return (
        <div className="games-warning">
          <h3>🎮 Ready to Play Games?</h3>
          <p>Games are available! To place bets with real tokens, you'll need MetaMask:</p>
          <a 
            href="https://metamask.io/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="install-metamask-btn"
          >
            Install MetaMask to Play with Real Tokens
          </a>
          <div className="games-preview">
            <h4>Available Games:</h4>
            <div className="game-preview-grid">
              <div className="game-preview-card">
                <span className="game-icon">🎲</span>
                <h5>Dice Roll</h5>
                <p>Bet on dice outcomes (1-6)</p>
                <p className="payout">5x payout</p>
              </div>
              <div className="game-preview-card">
                <span className="game-icon">🪙</span>
                <h5>Coin Flip</h5>
                <p>Heads or tails betting</p>
                <p className="payout">2x payout</p>
              </div>
              <div className="game-preview-card">
                <span className="game-icon">🎯</span>
                <h5>Roulette</h5>
                <p>Numbers and colors</p>
                <p className="payout">Up to 36x payout</p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (!wallet.isConnected) {
      return (
        <div className="games-section-disconnected">
          <div className="games-header">
            <h3>🎮 Casino Games</h3>
            <p>Connect your wallet to start playing with real tokens!</p>
          </div>
          
          <div className="wallet-connection-inline">
            <WalletConnection
              onConnect={connectWallet}
              isLoading={isLoading}
              error={error}
            />
          </div>

          <div className="games-preview">
            <h4>Games Available After Connection:</h4>
            <div className="game-tabs-preview">
              <div className="game-tab-preview">
                <span className="game-icon">🎲</span>
                <span>Dice Game</span>
              </div>
              <div className="game-tab-preview">
                <span className="game-icon">🪙</span>
                <span>Coin Flip</span>
              </div>
              <div className="game-tab-preview">
                <span className="game-icon">🎯</span>
                <span>Roulette</span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Wallet is connected - show full games
    return (
      <div className="games-section-connected">
        <div className="games-header">
          <h3>🎮 Casino Games</h3>
          <p>Choose your game and start playing with your tokens!</p>
        </div>
        
        <div className="game-tabs">
          <button 
            className={activeGame === 'dice' ? 'game-tab active' : 'game-tab'}
            onClick={() => setActiveGame('dice')}
          >
            🎲 Dice
          </button>
          <button 
            className={activeGame === 'coinflip' ? 'game-tab active' : 'game-tab'}
            onClick={() => setActiveGame('coinflip')}
          >
            🪙 Coin Flip
          </button>
          <button 
            className={activeGame === 'roulette' ? 'game-tab active' : 'game-tab'}
            onClick={() => setActiveGame('roulette')}
          >
            🎯 Roulette
          </button>
        </div>

        <div className="game-content">
          {activeGame === 'dice' && <DiceGame wallet={wallet} />}
          {activeGame === 'coinflip' && <CoinFlipGame wallet={wallet} />}
          {activeGame === 'roulette' && <RouletteGame wallet={wallet} />}
        </div>
      </div>
    );
  };

  const renderWalletSection = () => {
    if (!isMetaMaskInstalled) {
      return (
        <div className="metamask-warning">
          <h2>MetaMask Required</h2>
          <p>Please install MetaMask to use wallet features.</p>
          <a 
            href="https://metamask.io/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="install-metamask-btn"
          >
            Install MetaMask
          </a>
        </div>
      );
    }

    if (!wallet.isConnected) {
      return (
        <WalletConnection
          onConnect={connectWallet}
          isLoading={isLoading}
          error={error}
        />
      );
    }

    return (
      <div className="wallet-info-section">
        <div className="wallet-status">
          <h3>🔗 Wallet Connected</h3>
          <p>Address: {wallet.address?.slice(0, 6)}...{wallet.address?.slice(-4)}</p>
          <p>Network: {wallet.chainId ? `Chain ${wallet.chainId}` : 'Unknown'}</p>
          <button className="disconnect-btn" onClick={disconnectWallet}>
            Disconnect Wallet
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="main-dashboard">
      <div className="dashboard-tabs">
        <button 
          className={activeTab === 'games' ? 'dashboard-tab active' : 'dashboard-tab'}
          onClick={() => setActiveTab('games')}
        >
          🎮 Games
        </button>
        <button 
          className={activeTab === 'wallet' ? 'dashboard-tab active' : 'dashboard-tab'}
          onClick={() => setActiveTab('wallet')}
        >
          💳 Wallet
        </button>
        {wallet.isConnected && (
          <button 
            className={activeTab === 'tokens' ? 'dashboard-tab active' : 'dashboard-tab'}
            onClick={() => setActiveTab('tokens')}
          >
            🪙 Tokens
          </button>
        )}
      </div>

      <div className="dashboard-content">
        {activeTab === 'games' && renderGamesSection()}
        {activeTab === 'wallet' && renderWalletSection()}
        {activeTab === 'tokens' && wallet.isConnected && (
          <TokenDashboard wallet={wallet} onDisconnect={disconnectWallet} />
        )}
      </div>
    </div>
  );
};

export default MainDashboard;
