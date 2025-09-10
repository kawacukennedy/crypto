import { useState, useEffect, useCallback, useRef } from 'react';
import { ethers } from 'ethers';
import { WalletState } from '../types';
import { CRYPTO_TOKEN_ABI, getContractAddress } from '../utils/contracts';

interface RealTimeBalanceHook {
  balance: ethers.BigNumber | null;
  formattedBalance: string;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useRealTimeBalance = (
  wallet: WalletState,
  pollingInterval: number = 5000
): RealTimeBalanceHook => {
  const [balance, setBalance] = useState<ethers.BigNumber | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const contractRef = useRef<ethers.Contract | null>(null);

  const fetchBalance = useCallback(async () => {
    if (!wallet.provider || !wallet.address || !wallet.chainId) {
      setBalance(null);
      return;
    }

    const contractAddress = getContractAddress(wallet.chainId);
    if (!contractAddress) {
      setError('Contract not deployed on this network');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const contract = new ethers.Contract(contractAddress, CRYPTO_TOKEN_ABI, wallet.provider);
      contractRef.current = contract;

      const userBalance = await contract.balanceOf(wallet.address);
      setBalance(userBalance);
      
    } catch (err: any) {
      console.error('Error fetching balance:', err);
      setError(err.message || 'Failed to fetch balance');
      setBalance(null);
    } finally {
      setIsLoading(false);
    }
  }, [wallet.provider, wallet.address, wallet.chainId]);

  // Set up polling for balance updates
  useEffect(() => {
    fetchBalance();

    if (pollingInterval > 0) {
      intervalRef.current = setInterval(fetchBalance, pollingInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [fetchBalance, pollingInterval]);

  // Set up event listeners for real-time updates
  useEffect(() => {
    const contract = contractRef.current;
    if (!contract || !wallet.address) return;

    const handleTransfer = (from: string, to: string, value: ethers.BigNumber) => {
      if (from.toLowerCase() === wallet.address?.toLowerCase() || 
          to.toLowerCase() === wallet.address?.toLowerCase()) {
        // Balance changed, refetch immediately
        fetchBalance();
      }
    };

    try {
      // Listen for Transfer events that affect the user's balance
      contract.on('Transfer', handleTransfer);

      return () => {
        contract.off('Transfer', handleTransfer);
      };
    } catch (err) {
      console.error('Error setting up event listeners:', err);
    }
  }, [wallet.address, fetchBalance]);

  const formattedBalance = balance 
    ? parseFloat(ethers.utils.formatEther(balance)).toFixed(2)
    : '0.00';

  const refetch = useCallback(async () => {
    await fetchBalance();
  }, [fetchBalance]);

  return {
    balance,
    formattedBalance,
    isLoading,
    error,
    refetch
  };
};
