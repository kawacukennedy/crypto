import React from 'react';
import { TransactionState } from '../../types';

interface TransactionStatusProps {
  transactionState: TransactionState;
  onClear?: () => void;
}

const TransactionStatus: React.FC<TransactionStatusProps> = ({
  transactionState,
  onClear
}) => {
  const { loading, hash, error, success } = transactionState;

  if (!loading && !error && !success) {
    return null; // Don't show anything when there's no transaction activity
  }

  return (
    <div className="transaction-status">
      {loading && (
        <div className="status-item status-loading">
          <div className="status-icon">⏳</div>
          <div className="status-content">
            <h4>Transaction Pending</h4>
            <p>Please wait while your transaction is being processed...</p>
            {hash && (
              <p className="tx-hash">
                TX: {hash.slice(0, 10)}...{hash.slice(-8)}
              </p>
            )}
          </div>
        </div>
      )}

      {success && !loading && (
        <div className="status-item status-success">
          <div className="status-icon">✅</div>
          <div className="status-content">
            <h4>Transaction Successful!</h4>
            <p>Your transaction has been confirmed on the blockchain.</p>
            {hash && (
              <p className="tx-hash">
                TX: {hash.slice(0, 10)}...{hash.slice(-8)}
              </p>
            )}
            {onClear && (
              <button onClick={onClear} className="clear-btn">
                Clear
              </button>
            )}
          </div>
        </div>
      )}

      {error && !loading && (
        <div className="status-item status-error">
          <div className="status-icon">❌</div>
          <div className="status-content">
            <h4>Transaction Failed</h4>
            <p>{error}</p>
            {onClear && (
              <button onClick={onClear} className="clear-btn">
                Dismiss
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionStatus;
