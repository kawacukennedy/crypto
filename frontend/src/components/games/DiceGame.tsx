import React, { useState } from 'react';
import { ethers } from 'ethers';
import { WalletState } from '../../types';
import { useCryptoToken } from '../../hooks/useCryptoToken';
import { useCryptoGames } from '../../hooks/useCryptoGames';
import TransactionStatus from '../common/TransactionStatus';

interface DiceGameProps {
  wallet: WalletState;
}

const DiceGame: React.FC<DiceGameProps> = ({ wallet }) => {
  const { tokenInfo } = useCryptoToken(wallet);
  const { transactionState, playDice, clearTransactionState } = useCryptoGames(wallet);
  const [betAmount, setBetAmount] = useState('');
  const [selectedNumber, setSelectedNumber] = useState<number>(1);
  const [isRolling, setIsRolling] = useState(false);
  const [gameResult, setGameResult] = useState<{
    diceRoll: number;
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
      setIsRolling(true);
      setGameResult(null);

      const res = await playDice(betAmountBN, selectedNumber);
      const resultInfo: any = {
        diceRoll: res.result,
        playerWon: res.won,
        winAmount: res.winAmount ? ethers.utils.formatUnits(res.winAmount, tokenInfo.decimals) : undefined
      };

      setGameResult(resultInfo);
    } catch (e) {
      console.error(e);
    } finally {
      setIsRolling(false);
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
    <div className="game-container dice-game">
      <div className="game-header">
        <h3>🎲 Dice Roll Game</h3>
        <p>Bet on a number (1-6). Win 5x your bet if you guess correctly!</p>
      </div>

      <div className="game-stats">
        <div className="stat">
          <label>Your Balance:</label>
          <span>{formatTokenAmount(tokenInfo.balance, tokenInfo.decimals)} {tokenInfo.symbol}</span>
        </div>
      </div>

      <TransactionStatus 
        transactionState={transactionState} 
        onClear={clearTransactionState} 
      />

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
              disabled={isRolling}
            />
          </div>

          <div className="form-group">
            <label>Select Number (1-6):</label>
            <div className="number-selector">
              {[1, 2, 3, 4, 5, 6].map(num => (
                <button
                  key={num}
                  className={selectedNumber === num ? 'number-btn selected' : 'number-btn'}
                  onClick={() => setSelectedNumber(num)}
                  disabled={isRolling}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          <button 
            className="play-btn"
            onClick={handlePlay}
            disabled={!betAmount || isRolling || transactionState.loading}
          >
            {isRolling ? 'Rolling Dice...' : 'Roll Dice'}
          </button>
        </div>
      )}

      {isRolling && (
        <div className="dice-animation">
          <div className="spinning-dice">🎲</div>
          <p>Rolling...</p>
        </div>
      )}

      {gameResult && (
        <div className="game-result">
          <div className="result-dice">
            <span className="dice-face">{gameResult.diceRoll}</span>
          </div>
          <div className="result-info">
            <p>You guessed: <strong>{selectedNumber}</strong></p>
            <p>Dice rolled: <strong>{gameResult.diceRoll}</strong></p>
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
          <li>Choose a number between 1 and 6</li>
          <li>Place your bet amount</li>
          <li>Roll the dice!</li>
          <li>If your number matches the dice, you win 5x your bet</li>
          <li>If not, you lose your bet amount</li>
        </ul>
      </div>
    </div>
  );
};

export default DiceGame;
