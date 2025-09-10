import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { WalletState, TransactionState } from '../types';
import { CRYPTO_GAMES_ABI, CRYPTO_TOKEN_ABI, getGamesContractAddress, getContractAddress } from '../utils/contracts';

export interface GameStats {
  houseBalance: ethers.BigNumber;
  totalGamesPlayed: number;
  totalWinnings: ethers.BigNumber;
  totalLosses: ethers.BigNumber;
}

export interface GameResult {
  won: boolean;
  winAmount?: ethers.BigNumber;
  result: number;
  transactionHash: string;
}

export const useCryptoGames = (wallet: WalletState) => {
  const [gameStats, setGameStats] = useState<GameStats | null>(null);
  const [transactionState, setTransactionState] = useState<TransactionState>({
    loading: false,
    hash: null,
    error: null,
    success: false
  });
  const [minBet, setMinBet] = useState<ethers.BigNumber | null>(null);
  const [maxBet, setMaxBet] = useState<ethers.BigNumber | null>(null);
  const [houseEdge, setHouseEdge] = useState<number>(0);

  // Get games contract instance
  const getGamesContract = useCallback(() => {
    if (!wallet.signer || !wallet.chainId) return null;
    
    const contractAddress = getGamesContractAddress(wallet.chainId);
    if (!contractAddress) return null;

    return new ethers.Contract(contractAddress, CRYPTO_GAMES_ABI, wallet.signer);
  }, [wallet.signer, wallet.chainId]);

  // Get token contract instance for approvals
  const getTokenContract = useCallback(() => {
    if (!wallet.signer || !wallet.chainId) return null;
    
    const contractAddress = getContractAddress(wallet.chainId);
    if (!contractAddress) return null;

    return new ethers.Contract(contractAddress, CRYPTO_TOKEN_ABI, wallet.signer);
  }, [wallet.signer, wallet.chainId]);

  // Load game stats and contract info
  const loadGameInfo = useCallback(async () => {
    if (!wallet.provider || !wallet.chainId) return;

    const gamesAddress = getGamesContractAddress(wallet.chainId);
    if (!gamesAddress) return;

    try {
      const contract = new ethers.Contract(gamesAddress, CRYPTO_GAMES_ABI, wallet.provider);

      const [stats, minBetAmount, maxBetAmount, houseEdgeAmount] = await Promise.all([
        contract.getStats(),
        contract.MIN_BET(),
        contract.MAX_BET(),
        contract.HOUSE_EDGE()
      ]);

      setGameStats({
        houseBalance: stats._houseBalance,
        totalGamesPlayed: stats._totalGamesPlayed.toNumber(),
        totalWinnings: stats._totalWinnings,
        totalLosses: stats._totalLosses
      });

      setMinBet(minBetAmount);
      setMaxBet(maxBetAmount);
      setHouseEdge(houseEdgeAmount.toNumber() / 100); // Convert basis points to percentage

    } catch (error) {
      console.error('Error loading game info:', error);
    }
  }, [wallet.provider, wallet.chainId]);

  // Approve tokens for games contract
  const approveTokens = useCallback(async (amount: ethers.BigNumber) => {
    const tokenContract = getTokenContract();
    const gamesAddress = getGamesContractAddress(wallet.chainId!);
    
    if (!tokenContract || !gamesAddress) return;

    try {
      setTransactionState({ loading: true, hash: null, error: null, success: false });

      const tx = await tokenContract.approve(gamesAddress, amount);
      setTransactionState({ loading: true, hash: tx.hash, error: null, success: false });

      const receipt = await tx.wait();
      setTransactionState({ loading: false, hash: tx.hash, error: null, success: true });

      return receipt;
    } catch (error: any) {
      console.error('Approval error:', error);
      setTransactionState({
        loading: false,
        hash: null,
        error: error.reason || error.message || 'Approval failed',
        success: false
      });
      throw error;
    }
  }, [getTokenContract, wallet.chainId]);

  // Check token allowance
  const checkAllowance = useCallback(async (): Promise<ethers.BigNumber> => {
    const tokenContract = getTokenContract();
    const gamesAddress = getGamesContractAddress(wallet.chainId!);
    
    if (!tokenContract || !gamesAddress || !wallet.address) {
      return ethers.BigNumber.from(0);
    }

    try {
      return await tokenContract.allowance(wallet.address, gamesAddress);
    } catch (error) {
      console.error('Error checking allowance:', error);
      return ethers.BigNumber.from(0);
    }
  }, [getTokenContract, wallet.chainId, wallet.address]);

  // Play dice game
  const playDice = useCallback(async (betAmount: ethers.BigNumber, prediction: number): Promise<GameResult> => {
    const contract = getGamesContract();
    if (!contract) throw new Error('Games contract not available');

    try {
      setTransactionState({ loading: true, hash: null, error: null, success: false });

      // Check and approve if necessary
      const allowance = await checkAllowance();
      if (allowance.lt(betAmount)) {
        await approveTokens(betAmount);
      }

      const tx = await contract.playDice(betAmount, prediction);
      setTransactionState({ loading: true, hash: tx.hash, error: null, success: false });

      const receipt = await tx.wait();
      
      // Parse the GamePlayed event to get the result
      const gamePlayedEvent = receipt.events?.find((e: any) => e.event === 'GamePlayed');
      const won = gamePlayedEvent?.args?.won || false;
      const winAmount = gamePlayedEvent?.args?.winAmount || ethers.BigNumber.from(0);
      
      // Extract dice result from game data
      const gameData = gamePlayedEvent?.args?.gameData || '0x0000000000000000000000000000000000000000000000000000000000000000';
      const result = parseInt(gameData.slice(-2), 16); // Last byte is the result

      setTransactionState({ loading: false, hash: tx.hash, error: null, success: true });

      await loadGameInfo(); // Refresh stats

      return {
        won,
        winAmount: won ? winAmount : undefined,
        result,
        transactionHash: tx.hash
      };
    } catch (error: any) {
      console.error('Dice game error:', error);
      setTransactionState({
        loading: false,
        hash: null,
        error: error.reason || error.message || 'Game failed',
        success: false
      });
      throw error;
    }
  }, [getGamesContract, checkAllowance, approveTokens, loadGameInfo]);

  // Play coin flip game
  const playCoinFlip = useCallback(async (betAmount: ethers.BigNumber, prediction: number): Promise<GameResult> => {
    const contract = getGamesContract();
    if (!contract) throw new Error('Games contract not available');

    try {
      setTransactionState({ loading: true, hash: null, error: null, success: false });

      // Check and approve if necessary
      const allowance = await checkAllowance();
      if (allowance.lt(betAmount)) {
        await approveTokens(betAmount);
      }

      const tx = await contract.playCoinFlip(betAmount, prediction);
      setTransactionState({ loading: true, hash: tx.hash, error: null, success: false });

      const receipt = await tx.wait();
      
      // Parse the GamePlayed event to get the result
      const gamePlayedEvent = receipt.events?.find((e: any) => e.event === 'GamePlayed');
      const won = gamePlayedEvent?.args?.won || false;
      const winAmount = gamePlayedEvent?.args?.winAmount || ethers.BigNumber.from(0);
      
      // Extract coin result from game data
      const gameData = gamePlayedEvent?.args?.gameData || '0x0000000000000000000000000000000000000000000000000000000000000000';
      const result = parseInt(gameData.slice(-2), 16); // Last byte is the result

      setTransactionState({ loading: false, hash: tx.hash, error: null, success: true });

      await loadGameInfo(); // Refresh stats

      return {
        won,
        winAmount: won ? winAmount : undefined,
        result,
        transactionHash: tx.hash
      };
    } catch (error: any) {
      console.error('Coin flip game error:', error);
      setTransactionState({
        loading: false,
        hash: null,
        error: error.reason || error.message || 'Game failed',
        success: false
      });
      throw error;
    }
  }, [getGamesContract, checkAllowance, approveTokens, loadGameInfo]);

  // Play roulette game
  const playRoulette = useCallback(async (betAmount: ethers.BigNumber, betType: number, betValue: number): Promise<GameResult> => {
    const contract = getGamesContract();
    if (!contract) throw new Error('Games contract not available');

    try {
      setTransactionState({ loading: true, hash: null, error: null, success: false });

      // Check and approve if necessary
      const allowance = await checkAllowance();
      if (allowance.lt(betAmount)) {
        await approveTokens(betAmount);
      }

      const tx = await contract.playRoulette(betAmount, betType, betValue);
      setTransactionState({ loading: true, hash: tx.hash, error: null, success: false });

      const receipt = await tx.wait();
      
      // Parse the GamePlayed event to get the result
      const gamePlayedEvent = receipt.events?.find((e: any) => e.event === 'GamePlayed');
      const won = gamePlayedEvent?.args?.won || false;
      const winAmount = gamePlayedEvent?.args?.winAmount || ethers.BigNumber.from(0);
      
      // Extract roulette result from game data
      const gameData = gamePlayedEvent?.args?.gameData || '0x0000000000000000000000000000000000000000000000000000000000000000';
      const result = parseInt(gameData.slice(-2), 16); // Last byte is the result

      setTransactionState({ loading: false, hash: tx.hash, error: null, success: true });

      await loadGameInfo(); // Refresh stats

      return {
        won,
        winAmount: won ? winAmount : undefined,
        result,
        transactionHash: tx.hash
      };
    } catch (error: any) {
      console.error('Roulette game error:', error);
      setTransactionState({
        loading: false,
        hash: null,
        error: error.reason || error.message || 'Game failed',
        success: false
      });
      throw error;
    }
  }, [getGamesContract, checkAllowance, approveTokens, loadGameInfo]);

  // Clear transaction state
  const clearTransactionState = useCallback(() => {
    setTransactionState({ loading: false, hash: null, error: null, success: false });
  }, []);

  // Load game info when wallet changes
  useEffect(() => {
    if (wallet.isConnected && wallet.chainId) {
      loadGameInfo();
    }
  }, [wallet.isConnected, wallet.chainId, loadGameInfo]);

  return {
    gameStats,
    transactionState,
    minBet,
    maxBet,
    houseEdge,
    playDice,
    playCoinFlip,
    playRoulette,
    clearTransactionState,
    refreshGameInfo: loadGameInfo,
    checkAllowance
  };
};
