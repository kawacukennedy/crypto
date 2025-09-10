import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

interface GameResult {
  id: string;
  timestamp: number;
  game: 'dice' | 'coinflip' | 'roulette';
  betAmount: string;
  multiplier: number;
  result: string;
  payout: string;
  won: boolean;
  txHash: string;
}

interface GameStats {
  totalGames: number;
  totalWagered: string;
  totalWon: string;
  totalLost: string;
  netProfit: string;
  winRate: number;
  biggestWin: string;
  biggestLoss: string;
  favoriteGame: string;
}

interface GameHistoryProps {
  userAddress: string | null;
  onClose: () => void;
}

const GameHistory: React.FC<GameHistoryProps> = ({ userAddress, onClose }) => {
  const [gameHistory, setGameHistory] = useState<GameResult[]>([]);
  const [gameStats, setGameStats] = useState<GameStats | null>(null);
  const [activeTab, setActiveTab] = useState<'history' | 'stats'>('history');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (userAddress) {
      loadGameData();
    }
  }, [userAddress]);

  const loadGameData = () => {
    try {
      setIsLoading(true);
      
      // Load from localStorage (in a real app, this would come from blockchain events)
      const historyKey = `gameHistory_${userAddress}`;
      const storedHistory = localStorage.getItem(historyKey);
      const history: GameResult[] = storedHistory ? JSON.parse(storedHistory) : [];
      
      setGameHistory(history.sort((a, b) => b.timestamp - a.timestamp));
      calculateStats(history);
    } catch (error) {
      console.error('Error loading game data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (history: GameResult[]) => {
    if (history.length === 0) {
      setGameStats({
        totalGames: 0,
        totalWagered: '0',
        totalWon: '0',
        totalLost: '0',
        netProfit: '0',
        winRate: 0,
        biggestWin: '0',
        biggestLoss: '0',
        favoriteGame: 'none'
      });
      return;
    }

    const totalGames = history.length;
    const wins = history.filter(game => game.won);
    const losses = history.filter(game => !game.won);
    
    const totalWagered = history.reduce((sum, game) => 
      sum + parseFloat(game.betAmount), 0
    ).toFixed(2);
    
    const totalWon = wins.reduce((sum, game) => 
      sum + parseFloat(game.payout), 0
    ).toFixed(2);
    
    const totalLost = losses.reduce((sum, game) => 
      sum + parseFloat(game.betAmount), 0
    ).toFixed(2);
    
    const netProfit = (parseFloat(totalWon) - parseFloat(totalWagered)).toFixed(2);
    const winRate = (wins.length / totalGames) * 100;
    
    const biggestWin = wins.length > 0 
      ? Math.max(...wins.map(game => parseFloat(game.payout))).toFixed(2)
      : '0';
    
    const biggestLoss = losses.length > 0 
      ? Math.max(...losses.map(game => parseFloat(game.betAmount))).toFixed(2)
      : '0';
    
    // Calculate favorite game
    const gameCounts = history.reduce((acc, game) => {
      acc[game.game] = (acc[game.game] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const favoriteGame = Object.entries(gameCounts)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || 'none';

    setGameStats({
      totalGames,
      totalWagered,
      totalWon,
      totalLost,
      netProfit,
      winRate,
      biggestWin,
      biggestLoss,
      favoriteGame
    });
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const getGameEmoji = (game: string) => {
    switch (game) {
      case 'dice': return '🎲';
      case 'coinflip': return '🪙';
      case 'roulette': return '🎰';
      default: return '🎮';
    }
  };

  const clearHistory = () => {
    if (window.confirm('Are you sure you want to clear your game history? This action cannot be undone.')) {
      const historyKey = `gameHistory_${userAddress}`;
      localStorage.removeItem(historyKey);
      setGameHistory([]);
      calculateStats([]);
    }
  };

  if (isLoading) {
    return (
      <div className="game-history-modal">
        <div className="game-history-content">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading game data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="game-history-modal">
      <div className="game-history-content">
        <div className="game-history-header">
          <h2>🎰 Game Statistics & History</h2>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>

        <div className="game-history-tabs">
          <button 
            className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            📋 History ({gameHistory.length})
          </button>
          <button 
            className={`tab-button ${activeTab === 'stats' ? 'active' : ''}`}
            onClick={() => setActiveTab('stats')}
          >
            📊 Statistics
          </button>
        </div>

        {activeTab === 'history' && (
          <div className="history-tab">
            {gameHistory.length === 0 ? (
              <div className="empty-history">
                <p>🎲 No games played yet!</p>
                <p>Start playing to build your history.</p>
              </div>
            ) : (
              <>
                <div className="history-controls">
                  <button className="clear-history-button" onClick={clearHistory}>
                    🗑️ Clear History
                  </button>
                </div>
                <div className="history-list">
                  {gameHistory.map((game) => (
                    <div key={game.id} className={`history-item ${game.won ? 'win' : 'loss'}`}>
                      <div className="game-info">
                        <div className="game-header">
                          <span className="game-type">
                            {getGameEmoji(game.game)} {game.game.toUpperCase()}
                          </span>
                          <span className="game-time">
                            {formatTimestamp(game.timestamp)}
                          </span>
                        </div>
                        <div className="game-details">
                          <div className="bet-info">
                            <span>Bet: {game.betAmount} CRYPTO</span>
                            <span>Result: {game.result}</span>
                          </div>
                          <div className="outcome">
                            {game.won ? (
                              <span className="win-amount">+{game.payout} CRYPTO</span>
                            ) : (
                              <span className="loss-amount">-{game.betAmount} CRYPTO</span>
                            )}
                          </div>
                        </div>
                        <div className="tx-hash">
                          <a 
                            href={`https://etherscan.io/tx/${game.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            View TX: {game.txHash.substring(0, 10)}...
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'stats' && gameStats && (
          <div className="stats-tab">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-value">{gameStats.totalGames}</div>
                <div className="stat-label">Total Games</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-value">{gameStats.winRate.toFixed(1)}%</div>
                <div className="stat-label">Win Rate</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-value">{gameStats.totalWagered}</div>
                <div className="stat-label">Total Wagered</div>
              </div>
              
              <div className={`stat-card ${parseFloat(gameStats.netProfit) >= 0 ? 'profit' : 'loss'}`}>
                <div className="stat-value">
                  {parseFloat(gameStats.netProfit) >= 0 ? '+' : ''}{gameStats.netProfit}
                </div>
                <div className="stat-label">Net Profit</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-value">{gameStats.biggestWin}</div>
                <div className="stat-label">Biggest Win</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-value">{gameStats.biggestLoss}</div>
                <div className="stat-label">Biggest Loss</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-value">
                  {getGameEmoji(gameStats.favoriteGame)} {gameStats.favoriteGame.toUpperCase()}
                </div>
                <div className="stat-label">Favorite Game</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Utility function to save game result to localStorage
export const saveGameResult = (userAddress: string, result: Omit<GameResult, 'id' | 'timestamp'>) => {
  try {
    const historyKey = `gameHistory_${userAddress}`;
    const existingHistory = localStorage.getItem(historyKey);
    const history: GameResult[] = existingHistory ? JSON.parse(existingHistory) : [];
    
    const newResult: GameResult = {
      ...result,
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now()
    };
    
    history.push(newResult);
    
    // Keep only last 100 games to prevent localStorage from getting too large
    if (history.length > 100) {
      history.splice(0, history.length - 100);
    }
    
    localStorage.setItem(historyKey, JSON.stringify(history));
  } catch (error) {
    console.error('Error saving game result:', error);
  }
};

export default GameHistory;
