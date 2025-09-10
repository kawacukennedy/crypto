import axios from 'axios';
import Cookies from 'js-cookie';
import { User, LoginCredentials, SignupCredentials } from '../types';

// Mock API base URL - in production this would be your backend API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  const token = Cookies.get('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Mock user database (in production this would be a real database)
const mockUsers: User[] = [];
let userIdCounter = 1;

class AuthService {
  // Sign up a new user
  async signup(credentials: SignupCredentials): Promise<User> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check if user already exists
    const existingUser = mockUsers.find(
      user => user.email === credentials.email || user.walletAddress === credentials.walletAddress
    );

    if (existingUser) {
      throw new Error('User already exists with this email or wallet address');
    }

    // Verify the signature (in production you'd verify this on the backend)
    if (!this.isValidSignature(credentials.signature, credentials.walletAddress)) {
      throw new Error('Invalid signature');
    }

    // Create new user
    const newUser: User = {
      id: userIdCounter.toString(),
      email: credentials.email,
      walletAddress: credentials.walletAddress,
      createdAt: new Date().toISOString(),
      isVerified: true, // In production, you'd send a verification email
    };

    userIdCounter++;
    mockUsers.push(newUser);

    // Generate a mock JWT token
    const token = this.generateMockToken(newUser);
    Cookies.set('authToken', token, { expires: 7 }); // 7 days

    // Store user in localStorage for persistence
    localStorage.setItem('user', JSON.stringify(newUser));

    return newUser;
  }

  // Login an existing user
  async login(credentials: LoginCredentials): Promise<User> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Find user
    const user = mockUsers.find(
      u => u.email === credentials.email && u.walletAddress === credentials.walletAddress
    );

    if (!user) {
      throw new Error('User not found. Please sign up first.');
    }

    // Verify signature
    if (!this.isValidSignature(credentials.signature, credentials.walletAddress)) {
      throw new Error('Invalid signature');
    }

    // Generate token
    const token = this.generateMockToken(user);
    Cookies.set('authToken', token, { expires: 7 });

    // Store user in localStorage
    localStorage.setItem('user', JSON.stringify(user));

    return user;
  }

  // Logout user
  async logout(): Promise<void> {
    Cookies.remove('authToken');
    localStorage.removeItem('user');
  }

  // Get current user from localStorage
  getCurrentUser(): User | null {
    try {
      const userStr = localStorage.getItem('user');
      const token = Cookies.get('authToken');
      
      if (!userStr || !token) {
        return null;
      }

      const user = JSON.parse(userStr);
      
      // Verify token is still valid (in production, you'd validate with backend)
      if (this.isTokenValid(token)) {
        return user;
      }
      
      // Token expired, clear storage
      this.logout();
      return null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  // Verify wallet signature for authentication
  async verifyWalletSignature(address: string, message: string, signature: string): Promise<boolean> {
    try {
      // In production, you'd verify this on the backend
      return this.isValidSignature(signature, address);
    } catch (error) {
      console.error('Error verifying signature:', error);
      return false;
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = Cookies.get('authToken');
    const user = localStorage.getItem('user');
    return !!(token && user && this.isTokenValid(token));
  }

  // Private helper methods
  private isValidSignature(signature: string, address: string): boolean {
    // Mock signature validation - in production you'd use ethers.utils.verifyMessage
    // For demo purposes, we'll accept any non-empty signature
    return signature.length > 0 && address.length > 0;
  }

  private generateMockToken(user: User): string {
    // Mock JWT token generation
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({ 
      userId: user.id, 
      email: user.email,
      exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days
    }));
    const signature = btoa(`mock-signature-${user.id}`);
    
    return `${header}.${payload}.${signature}`;
  }

  private isTokenValid(token: string): boolean {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return false;
      
      const payload = JSON.parse(atob(parts[1]));
      const exp = payload.exp * 1000; // Convert to milliseconds
      
      return Date.now() < exp;
    } catch (error) {
      return false;
    }
  }
}

export const authService = new AuthService();
