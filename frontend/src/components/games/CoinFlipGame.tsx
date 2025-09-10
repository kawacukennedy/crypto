import React, { useState } from 'react';
import { ethers } from 'ethers';
import { WalletState } from '../../types';
import { useCryptoToken } from '../../hooks/useCryptoToken';
import { useCryptoGames } from '../../hooks/useCryptoGames';

interface CoinFlipGameProps {
  wallet: WalletState;
}

type CoinSide = 'heads' | 'tails';

const CoinFlipGame: React.FC<CoinFlipGameProps> = ({ wallet }) => {
  const { tokenInfo } = useCryptoToken(wallet);
  const { transactionState, playCoinFlip } = useCryptoGames(wallet);
  const [betAmount, setBetAmount] = useState('');
  const [selectedSide, setSelectedSide] = useState<CoinSide>('heads');
  const [isFlipping, setIsFlipping] = useState(false);
  const [gameResult, setGameResult] = useState<{
    coinResult: CoinSide;
    playerWon: boolean;
    winAmount?: string;
  } | null>(null);

  const formatTokenAmount = (amount: ethers.BigNumber | undefined, decimals: number) => {
    if (!amount) return '0';
    return ethers.utils.formatUnits(amount, decimals);
  };


  const handlePlay = async () => {
    if (!betAmount || !tokenInfo) return;
    
    const betAmountBN = ethers.utils.parseUnits(betAmount, tokenInfo.decimals);
    if (betAmountBN.gt(tokenInfo.balance)) {
      alert('Insufficient balance!');
      return;
    }

    try {
      setIsFlipping(true);
      setGameResult(null);

      // Convert selectedSide to number: heads=0, tails=1
      const prediction = selectedSide === 'heads' ? 0 : 1;
      const res = await playCoinFlip(betAmountBN, prediction);
      
      const resultSide: CoinSide = res.result === 0 ? 'heads' : 'tails';
      const resultInfo: any = {
        coinResult: resultSide,
        playerWon: res.won,
        winAmount: res.winAmount ? ethers.utils.formatUnits(res.winAmount, tokenInfo.decimals) : undefined
      };

      setGameResult(resultInfo);
    } catch (e) {
      console.error(e);
    } finally {
      setIsFlipping(false);
    }
  };

  const resetGame = () => {
    setGameResult(null);
    setBetAmount('');
  };

  if (!tokenInfo) {
    return (
      <div className="game-container">
        <p>Connect your wallet and ensure tokens are available to play.</p>
      </div>
    );
  }

  return (
    <div className="game-container coin-flip-game">
      <div className="game-header">
        <h3>🪙 Coin Flip Game</h3>
        <p>Bet on heads or tails. Win 2x your bet if you guess correctly!</p>
      </div>

      <div className="game-stats">
        <div className="stat">
          <label>Your Balance:</label>
          <span>{formatTokenAmount(tokenInfo.balance, tokenInfo.decimals)} {tokenInfo.symbol}</span>
        </div>
      </div>

      {!gameResult && (
        <div className="game-controls">
          <div className="form-group">
            <label>Bet Amount:</label>
            <input
              type="number"
              value={betAmount}
              onChange={(e) => setBetAmount(e.target.value)}
              placeholder="0.0"
              step="0.01"
              min="0"
              max={formatTokenAmount(tokenInfo.balance, tokenInfo.decimals)}
              disabled={isFlipping}
            />
          </div>

          <div className="form-group">
            <label>Choose Side:</label>
            <div className="coin-selector">
              <button
                className={selectedSide === 'heads' ? 'coin-btn selected' : 'coin-btn'}
                onClick={() => setSelectedSide('heads')}
                disabled={isFlipping}
              >
                <div className="coin heads">
                  <span>👑</span>
                  <small>Heads</small>
                </div>
              </button>
              <button
                className={selectedSide === 'tails' ? 'coin-btn selected' : 'coin-btn'}
                onClick={() => setSelectedSide('tails')}
                disabled={isFlipping}
              >
                <div className="coin tails">
                  <span>🏛️</span>
                  <small>Tails</small>
                </div>
              </button>
            </div>
          </div>

          <button 
            className="play-btn"
            onClick={handlePlay}
            disabled={!betAmount || isFlipping || transactionState.loading}
          >
            {isFlipping ? 'Flipping Coin...' : 'Flip Coin'}
          </button>
        </div>
      )}

      {isFlipping && (
        <div className="coin-animation">
          <div className="flipping-coin">🪙</div>
          <p>Flipping...</p>
        </div>
      )}

      {gameResult && (
        <div className="game-result">
          <div className="result-coin">
            <div className={`coin-result ${gameResult.coinResult}`}>
              {gameResult.coinResult === 'heads' ? '👑' : '🏛️'}
            </div>
            <p className="coin-label">
              {gameResult.coinResult.charAt(0).toUpperCase() + gameResult.coinResult.slice(1)}
            </p>
          </div>
          <div className="result-info">
            <p>You chose: <strong>{selectedSide.charAt(0).toUpperCase() + selectedSide.slice(1)}</strong></p>
            <p>Coin landed on: <strong>{gameResult.coinResult.charAt(0).toUpperCase() + gameResult.coinResult.slice(1)}</strong></p>
            <p className={gameResult.playerWon ? 'win-text' : 'lose-text'}>
              {gameResult.playerWon ? (
                <>🎉 You Won! +{gameResult.winAmount} {tokenInfo.symbol}</>
              ) : (
                <>😢 You Lost! -{betAmount} {tokenInfo.symbol}</>
              )}
            </p>
          </div>
          <div className="result-actions">
            <button onClick={resetGame} className="play-again-btn">
              Play Again
            </button>
          </div>
        </div>
      )}

      <div className="game-rules">
        <h4>How to Play:</h4>
        <ul>
          <li>Choose either Heads or Tails</li>
          <li>Place your bet amount</li>
          <li>Flip the coin!</li>
          <li>If the coin matches your choice, you win 2x your bet</li>
          <li>If not, you lose your bet amount</li>
        </ul>
      </div>
    </div>
  );
};

export default CoinFlipGame;
