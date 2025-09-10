import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { WalletState, TokenInfo, TransactionState } from '../types';
import { CRYPTO_TOKEN_ABI, getContractAddress } from '../utils/contracts';

export const useCryptoToken = (wallet: WalletState) => {
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [transactionState, setTransactionState] = useState<TransactionState>({
    loading: false,
    hash: null,
    error: null,
    success: false
  });
  const [isOwner, setIsOwner] = useState(false);

  // Get contract instance
  const getContract = useCallback(() => {
    if (!wallet.signer || !wallet.chainId) return null;
    
    const contractAddress = getContractAddress(wallet.chainId);
    if (!contractAddress) return null;

    return new ethers.Contract(contractAddress, CRYPTO_TOKEN_ABI, wallet.signer);
  }, [wallet.signer, wallet.chainId]);

  // Load token information
  const loadTokenInfo = useCallback(async () => {
    if (!wallet.provider || !wallet.address || !wallet.chainId) return;

    const contractAddress = getContractAddress(wallet.chainId);
    if (!contractAddress) return;

    try {
      const contract = new ethers.Contract(contractAddress, CRYPTO_TOKEN_ABI, wallet.provider);

      const [name, symbol, decimals, totalSupply, balance, owner] = await Promise.all([
        contract.name(),
        contract.symbol(),
        contract.decimals(),
        contract.totalSupply(),
        contract.balanceOf(wallet.address),
        contract.owner()
      ]);

      setTokenInfo({
        name,
        symbol,
        decimals,
        totalSupply,
        balance,
        allowances: {}
      });

      setIsOwner(owner.toLowerCase() === wallet.address.toLowerCase());

    } catch (error) {
      console.error('Error loading token info:', error);
    }
  }, [wallet.provider, wallet.address, wallet.chainId]);

  // Transfer tokens
  const transfer = useCallback(async (to: string, amount: string) => {
    const contract = getContract();
    if (!contract || !tokenInfo) return;

    try {
      setTransactionState({ loading: true, hash: null, error: null, success: false });

      const parsedAmount = ethers.utils.parseUnits(amount, tokenInfo.decimals);
      const tx = await contract.transfer(to, parsedAmount);

      setTransactionState({ loading: true, hash: tx.hash, error: null, success: false });

      const receipt = await tx.wait();
      
      setTransactionState({ loading: false, hash: tx.hash, error: null, success: true });

      // Reload token info to update balance
      await loadTokenInfo();

      return receipt;
    } catch (error: any) {
      console.error('Transfer error:', error);
      setTransactionState({ 
        loading: false, 
        hash: null, 
        error: error.reason || error.message || 'Transaction failed', 
        success: false 
      });
      throw error;
    }
  }, [getContract, tokenInfo, loadTokenInfo]);

  // Batch transfer tokens
  const batchTransfer = useCallback(async (recipients: string[], amounts: string[]) => {
    const contract = getContract();
    if (!contract || !tokenInfo) return;

    try {
      setTransactionState({ loading: true, hash: null, error: null, success: false });

      const parsedAmounts = amounts.map(amount => 
        ethers.utils.parseUnits(amount, tokenInfo.decimals)
      );

      const tx = await contract.batchTransfer(recipients, parsedAmounts);
      
      setTransactionState({ loading: true, hash: tx.hash, error: null, success: false });

      const receipt = await tx.wait();
      
      setTransactionState({ loading: false, hash: tx.hash, error: null, success: true });

      await loadTokenInfo();

      return receipt;
    } catch (error: any) {
      console.error('Batch transfer error:', error);
      setTransactionState({ 
        loading: false, 
        hash: null, 
        error: error.reason || error.message || 'Transaction failed', 
        success: false 
      });
      throw error;
    }
  }, [getContract, tokenInfo, loadTokenInfo]);

  // Approve spending
  const approve = useCallback(async (spender: string, amount: string) => {
    const contract = getContract();
    if (!contract || !tokenInfo) return;

    try {
      setTransactionState({ loading: true, hash: null, error: null, success: false });

      const parsedAmount = ethers.utils.parseUnits(amount, tokenInfo.decimals);
      const tx = await contract.approve(spender, parsedAmount);

      setTransactionState({ loading: true, hash: tx.hash, error: null, success: false });

      const receipt = await tx.wait();
      
      setTransactionState({ loading: false, hash: tx.hash, error: null, success: true });

      return receipt;
    } catch (error: any) {
      console.error('Approve error:', error);
      setTransactionState({ 
        loading: false, 
        hash: null, 
        error: error.reason || error.message || 'Transaction failed', 
        success: false 
      });
      throw error;
    }
  }, [getContract, tokenInfo]);

  // Mint tokens (owner only)
  const mint = useCallback(async (to: string, amount: string) => {
    const contract = getContract();
    if (!contract || !tokenInfo || !isOwner) return;

    try {
      setTransactionState({ loading: true, hash: null, error: null, success: false });

      const parsedAmount = ethers.utils.parseUnits(amount, tokenInfo.decimals);
      const tx = await contract.mint(to, parsedAmount);

      setTransactionState({ loading: true, hash: tx.hash, error: null, success: false });

      const receipt = await tx.wait();
      
      setTransactionState({ loading: false, hash: tx.hash, error: null, success: true });

      await loadTokenInfo();

      return receipt;
    } catch (error: any) {
      console.error('Mint error:', error);
      setTransactionState({ 
        loading: false, 
        hash: null, 
        error: error.reason || error.message || 'Transaction failed', 
        success: false 
      });
      throw error;
    }
  }, [getContract, tokenInfo, isOwner, loadTokenInfo]);

  // Burn tokens
  const burn = useCallback(async (amount: string) => {
    const contract = getContract();
    if (!contract || !tokenInfo) return;

    try {
      setTransactionState({ loading: true, hash: null, error: null, success: false });

      const parsedAmount = ethers.utils.parseUnits(amount, tokenInfo.decimals);
      const tx = await contract.burn(parsedAmount);

      setTransactionState({ loading: true, hash: tx.hash, error: null, success: false });

      const receipt = await tx.wait();
      
      setTransactionState({ loading: false, hash: tx.hash, error: null, success: true });

      await loadTokenInfo();

      return receipt;
    } catch (error: any) {
      console.error('Burn error:', error);
      setTransactionState({ 
        loading: false, 
        hash: null, 
        error: error.reason || error.message || 'Transaction failed', 
        success: false 
      });
      throw error;
    }
  }, [getContract, tokenInfo, loadTokenInfo]);

  // Get allowance
  const getAllowance = useCallback(async (owner: string, spender: string): Promise<ethers.BigNumber | null> => {
    if (!wallet.provider || !wallet.chainId) return null;

    const contractAddress = getContractAddress(wallet.chainId);
    if (!contractAddress) return null;

    try {
      const contract = new ethers.Contract(contractAddress, CRYPTO_TOKEN_ABI, wallet.provider);
      return await contract.allowance(owner, spender);
    } catch (error) {
      console.error('Error getting allowance:', error);
      return null;
    }
  }, [wallet.provider, wallet.chainId]);

  // Clear transaction state
  const clearTransactionState = useCallback(() => {
    setTransactionState({ loading: false, hash: null, error: null, success: false });
  }, []);

  // Load token info when wallet changes
  useEffect(() => {
    if (wallet.isConnected && wallet.chainId) {
      loadTokenInfo();
    }
  }, [wallet.isConnected, wallet.chainId, wallet.address, loadTokenInfo]);

  return {
    tokenInfo,
    transactionState,
    isOwner,
    transfer,
    batchTransfer,
    approve,
    mint,
    burn,
    getAllowance,
    clearTransactionState,
    refreshTokenInfo: loadTokenInfo
  };
};
