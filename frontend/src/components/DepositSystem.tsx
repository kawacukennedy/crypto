import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useMultiChainWallet } from '../hooks/useMultiChainWallet';

interface DepositSystemProps {
  onDeposit: (tokens: number) => void;
}

const DepositSystem: React.FC<DepositSystemProps> = ({ onDeposit }) => {
  const { multiChain, solana, bitcoin } = useMultiChainWallet();
  const [activeTab, setActiveTab] = useState<'solana' | 'bitcoin'>('solana');
  const [depositAmount, setDepositAmount] = useState('');
  const [isDepositing, setIsDepositing] = useState(false);
  const [depositResult, setDepositResult] = useState<{
    success: boolean;
    txHash: string;
    tokens: number;
  } | null>(null);

  const handleSolanaDeposit = async () => {
    if (!depositAmount || !solana.connected) return;

    try {
      setIsDepositing(true);
      const amount = parseFloat(depositAmount);
      const result = await multiChain.depositSolana(amount);
      
      setDepositResult({
        success: result.success,
        txHash: result.txHash,
        tokens: result.gameTokensReceived
      });

      if (result.success) {
        onDeposit(result.gameTokensReceived);
      }
    } catch (error) {
      console.error('Solana deposit failed:', error);
    } finally {
      setIsDepositing(false);
    }
  };

  const handleBitcoinDeposit = async () => {
    if (!depositAmount) return;

    try {
      setIsDepositing(true);
      const amount = parseFloat(depositAmount);
      const result = await multiChain.depositBitcoin(amount);
      
      setDepositResult({
        success: result.success,
        txHash: result.txHash,
        tokens: result.gameTokensReceived
      });

      if (result.success) {
        onDeposit(result.gameTokensReceived);
      }
    } catch (error) {
      console.error('Bitcoin deposit failed:', error);
    } finally {
      setIsDepositing(false);
    }
  };

  return (
    <div className="deposit-system">
      <div className="deposit-header">
        <h2>💰 Deposit Crypto</h2>
        <p>Convert your crypto to game tokens</p>
      </div>

      <div className="deposit-tabs">
        <button 
          className={activeTab === 'solana' ? 'deposit-tab active' : 'deposit-tab'}
          onClick={() => setActiveTab('solana')}
        >
          <span className="chain-icon">◎</span>
          Solana
        </button>
        <button 
          className={activeTab === 'bitcoin' ? 'deposit-tab active' : 'deposit-tab'}
          onClick={() => setActiveTab('bitcoin')}
        >
          <span className="chain-icon">₿</span>
          Bitcoin
        </button>
      </div>

      <div className="deposit-content">
        {activeTab === 'solana' && (
          <div className="solana-deposit">
            <div className="wallet-connection">
              <WalletMultiButton />
            </div>

            {solana.connected && (
              <>
                <div className="balance-info">
                  <p>SOL Balance: {solana.balance?.toFixed(4) || '0'} SOL</p>
                  <p>Conversion Rate: 1 SOL = 100 LUXE tokens</p>
                </div>

                <div className="deposit-form">
                  <div className="form-group">
                    <label>Amount to Deposit (SOL):</label>
                    <input
                      type="number"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      placeholder="0.1"
                      step="0.01"
                      min="0"
                      max={solana.balance || 0}
                    />
                  </div>

                  {depositAmount && (
                    <div className="conversion-preview">
                      <p>You will receive: <strong>{(parseFloat(depositAmount) * 100).toLocaleString()} LUXE</strong></p>
                    </div>
                  )}

                  <button
                    className="deposit-btn"
                    onClick={handleSolanaDeposit}
                    disabled={!depositAmount || isDepositing || !solana.connected}
                  >
                    {isDepositing ? 'Processing Deposit...' : 'Deposit SOL'}
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'bitcoin' && (
          <div className="bitcoin-deposit">
            <div className="wallet-connection">
              {!bitcoin.connected ? (
                <button className="wallet-connect-btn" onClick={bitcoin.connect}>
                  Connect Bitcoin Wallet
                </button>
              ) : (
                <div className="connected-wallet">
                  <span>✅ Bitcoin Wallet Connected</span>
                  <p>{bitcoin.address}</p>
                </div>
              )}
            </div>

            {bitcoin.connected && (
              <>
                <div className="balance-info">
                  <p>BTC Balance: {bitcoin.balance?.toFixed(8) || '0'} BTC</p>
                  <p>Conversion Rate: 1 BTC = 50,000 LUXE tokens</p>
                </div>

                <div className="deposit-form">
                  <div className="form-group">
                    <label>Amount to Deposit (BTC):</label>
                    <input
                      type="number"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      placeholder="0.001"
                      step="0.001"
                      min="0"
                      max={bitcoin.balance || 0}
                    />
                  </div>

                  {depositAmount && (
                    <div className="conversion-preview">
                      <p>You will receive: <strong>{(parseFloat(depositAmount) * 50000).toLocaleString()} LUXE</strong></p>
                    </div>
                  )}

                  <button
                    className="deposit-btn"
                    onClick={handleBitcoinDeposit}
                    disabled={!depositAmount || isDepositing || !bitcoin.connected}
                  >
                    {isDepositing ? 'Processing Deposit...' : 'Deposit BTC'}
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {depositResult && (
          <div className={`deposit-result ${depositResult.success ? 'success' : 'error'}`}>
            {depositResult.success ? (
              <>
                <h3>🎉 Deposit Successful!</h3>
                <p>You received <strong>{depositResult.tokens.toLocaleString()} LUXE tokens</strong></p>
                <p>Transaction: {depositResult.txHash.slice(0, 8)}...{depositResult.txHash.slice(-8)}</p>
              </>
            ) : (
              <>
                <h3>❌ Deposit Failed</h3>
                <p>Please try again or contact support</p>
              </>
            )}
            <button onClick={() => setDepositResult(null)} className="close-result-btn">
              Close
            </button>
          </div>
        )}
      </div>

      <div className="deposit-info">
        <h4>How it works:</h4>
        <ul>
          <li>Connect your Solana or Bitcoin wallet</li>
          <li>Choose amount to deposit</li>
          <li>Confirm transaction in your wallet</li>
          <li>Receive LUXE tokens instantly</li>
          <li>Start playing games!</li>
        </ul>
      </div>
    </div>
  );
};

export default DepositSystem;
