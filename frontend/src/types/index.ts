import { ethers } from 'ethers';

// Wallet connection types
export interface WalletState {
  isConnected: boolean;
  address: string | null;
  provider: ethers.providers.Web3Provider | null;
  signer: ethers.Signer | null;
  chainId: number | null;
}

// Token information
export interface TokenInfo {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: ethers.BigNumber;
  balance: ethers.BigNumber;
  allowances: { [spender: string]: ethers.BigNumber };
}

// Transaction types
export interface TransactionState {
  loading: boolean;
  hash: string | null;
  error: string | null;
  success: boolean;
}

// Contract addresses for different networks
export interface ContractAddresses {
  [chainId: number]: {
    CryptoToken: string;
  };
}

// Network information
export interface NetworkInfo {
  chainId: number;
  name: string;
  currency: string;
  rpcUrl: string;
  blockExplorer: string;
}

// Error types
export interface ErrorInfo {
  code?: number;
  message: string;
  data?: any;
}

// Authentication types
export interface User {
  id: string;
  email: string;
  walletAddress: string;
  createdAt: string;
  isVerified: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  walletAddress: string;
  signature: string;
}

export interface SignupCredentials {
  email: string;
  walletAddress: string;
  signature: string;
}
