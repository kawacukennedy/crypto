import React, { useState } from 'react';
import { ethers } from 'ethers';
import { WalletState } from '../../types';
import { useCryptoToken } from '../../hooks/useCryptoToken';
import { useCryptoGames } from '../../hooks/useCryptoGames';

interface RouletteGameProps {
  wallet: WalletState;
}

type BetType = 'number' | 'red' | 'black' | 'even' | 'odd';
type RouletteNumber = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 | 30 | 31 | 32 | 33 | 34 | 35 | 36;

const RouletteGame: React.FC<RouletteGameProps> = ({ wallet }) => {
  const { tokenInfo } = useCryptoToken(wallet);
  const { transactionState, playRoulette } = useCryptoGames(wallet);
  const [betAmount, setBetAmount] = useState('');
  const [betType, setBetType] = useState<BetType>('red');
  const [selectedNumber, setSelectedNumber] = useState<RouletteNumber>(1);
  const [isSpinning, setIsSpinning] = useState(false);
  const [gameResult, setGameResult] = useState<{
    number: RouletteNumber;
    color: 'red' | 'black' | 'green';
    playerWon: boolean;
    winAmount?: string;
  } | null>(null);

  // Roulette number colors (simplified European roulette)
  const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];

  const formatTokenAmount = (amount: ethers.BigNumber | undefined, decimals: number) => {
    if (!amount) return '0';
    return ethers.utils.formatUnits(amount, decimals);
  };

  const getNumberColor = (num: RouletteNumber): 'red' | 'black' | 'green' => {
    if (num === 0) return 'green';
    if (redNumbers.includes(num)) return 'red';
    return 'black';
  };


  const handlePlay = async () => {
    if (!betAmount || !tokenInfo) return;
    
    const betAmountBN = ethers.utils.parseUnits(betAmount, tokenInfo.decimals);
    if (betAmountBN.gt(tokenInfo.balance)) {
      alert('Insufficient balance!');
      return;
    }

    try {
      setIsSpinning(true);
      setGameResult(null);

      // Map betType to contract format: 0=number, 1=red, 2=black, 3=even, 4=odd
      let contractBetType = 0;
      if (betType === 'red') contractBetType = 1;
      else if (betType === 'black') contractBetType = 2;
      else if (betType === 'even') contractBetType = 3;
      else if (betType === 'odd') contractBetType = 4;

      const res = await playRoulette(betAmountBN, contractBetType, selectedNumber);
      
      const color = getNumberColor(res.result as RouletteNumber);
      const resultInfo: any = {
        number: res.result,
        color,
        playerWon: res.won,
        winAmount: res.winAmount ? ethers.utils.formatUnits(res.winAmount, tokenInfo.decimals) : undefined
      };

      setGameResult(resultInfo);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSpinning(false);
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
    <div className="game-container roulette-game">
      <div className="game-header">
        <h3>🎯 Roulette Game</h3>
        <p>Place your bets on numbers or colors!</p>
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
              disabled={isSpinning}
            />
          </div>

          <div className="form-group">
            <label>Bet Type:</label>
            <div className="bet-type-selector">
              <button
                className={betType === 'red' ? 'bet-btn selected red' : 'bet-btn red'}
                onClick={() => setBetType('red')}
                disabled={isSpinning}
              >
                🔴 Red (2x)
              </button>
              <button
                className={betType === 'black' ? 'bet-btn selected black' : 'bet-btn black'}
                onClick={() => setBetType('black')}
                disabled={isSpinning}
              >
                ⚫ Black (2x)
              </button>
              <button
                className={betType === 'even' ? 'bet-btn selected' : 'bet-btn'}
                onClick={() => setBetType('even')}
                disabled={isSpinning}
              >
                📊 Even (2x)
              </button>
              <button
                className={betType === 'odd' ? 'bet-btn selected' : 'bet-btn'}
                onClick={() => setBetType('odd')}
                disabled={isSpinning}
              >
                📈 Odd (2x)
              </button>
              <button
                className={betType === 'number' ? 'bet-btn selected' : 'bet-btn'}
                onClick={() => setBetType('number')}
                disabled={isSpinning}
              >
                🎯 Number (36x)
              </button>
            </div>
          </div>

          {betType === 'number' && (
            <div className="form-group">
              <label>Select Number (0-36):</label>
              <div className="number-grid">
                {Array.from({ length: 37 }, (_, i) => i as RouletteNumber).map(num => (
                  <button
                    key={num}
                    className={`number-btn ${getNumberColor(num)} ${selectedNumber === num ? 'selected' : ''}`}
                    onClick={() => setSelectedNumber(num)}
                    disabled={isSpinning}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button 
            className="play-btn"
            onClick={handlePlay}
            disabled={!betAmount || isSpinning || transactionState.loading}
          >
            {isSpinning ? 'Spinning...' : 'Spin Roulette'}
          </button>
        </div>
      )}

      {isSpinning && (
        <div className="roulette-animation">
          <div className="spinning-wheel">🎯</div>
          <p>Spinning the wheel...</p>
        </div>
      )}

      {gameResult && (
        <div className="game-result">
          <div className="result-number">
            <div className={`roulette-result ${gameResult.color}`}>
              {gameResult.number}
            </div>
            <p className="number-label">
              {gameResult.color.charAt(0).toUpperCase() + gameResult.color.slice(1)} {gameResult.number}
            </p>
          </div>
          <div className="result-info">
            <p>Your bet: <strong>
              {betType === 'number' ? `Number ${selectedNumber}` : betType.charAt(0).toUpperCase() + betType.slice(1)}
            </strong></p>
            <p>Result: <strong>{gameResult.color.charAt(0).toUpperCase() + gameResult.color.slice(1)} {gameResult.number}</strong></p>
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
          <li><strong>Red/Black/Even/Odd:</strong> 2x payout if you win</li>
          <li><strong>Single Number:</strong> 36x payout if you win</li>
          <li>Green 0 wins only for exact number bets</li>
          <li>Place your bet and spin the wheel!</li>
        </ul>
      </div>
    </div>
  );
};

export default RouletteGame;
