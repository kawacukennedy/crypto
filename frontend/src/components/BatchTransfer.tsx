import React, { useState } from 'react';
import { useCryptoToken } from '../hooks/useCryptoToken';
import { WalletState } from '../types';

interface BatchTransferProps {
  wallet: WalletState;
}

interface BatchTransferEntry {
  id: string;
  address: string;
  amount: string;
}

const BatchTransfer: React.FC<BatchTransferProps> = ({ wallet }) => {
  const { tokenInfo, transactionState, batchTransfer } = useCryptoToken(wallet);
  const [entries, setEntries] = useState<BatchTransferEntry[]>([
    { id: '1', address: '', amount: '' }
  ]);

  const addEntry = () => {
    const newId = Date.now().toString();
    setEntries([...entries, { id: newId, address: '', amount: '' }]);
  };

  const removeEntry = (id: string) => {
    if (entries.length > 1) {
      setEntries(entries.filter(entry => entry.id !== id));
    }
  };

  const updateEntry = (id: string, field: 'address' | 'amount', value: string) => {
    setEntries(entries.map(entry => 
      entry.id === id ? { ...entry, [field]: value } : entry
    ));
  };

  const handleBatchTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validEntries = entries.filter(entry => entry.address && entry.amount);
    if (validEntries.length === 0) return;

    const addresses = validEntries.map(entry => entry.address);
    const amounts = validEntries.map(entry => entry.amount);

    try {
      await batchTransfer(addresses, amounts);
      // Clear form on success
      setEntries([{ id: '1', address: '', amount: '' }]);
    } catch (err: any) {
      console.error('Batch transfer failed:', err);
    }
  };

  const getTotalAmount = () => {
    return entries.reduce((total, entry) => {
      const amount = parseFloat(entry.amount) || 0;
      return total + amount;
    }, 0);
  };

  const isFormValid = () => {
    return entries.some(entry => entry.address && entry.amount) && 
           !transactionState.loading;
  };

  if (!tokenInfo) {
    return (
      <div className="batch-transfer">
        <p>Loading token information...</p>
      </div>
    );
  }

  return (
    <div className="batch-transfer">
      <h3>Batch Transfer Tokens</h3>
      <p className="batch-description">
        Send tokens to multiple addresses in a single transaction. This saves gas fees compared to individual transfers.
      </p>

      <form onSubmit={handleBatchTransfer}>
        <div className="batch-entries">
          {entries.map((entry, index) => (
            <div key={entry.id} className="batch-entry">
              <div className="entry-header">
                <span className="entry-number">#{index + 1}</span>
                {entries.length > 1 && (
                  <button
                    type="button"
                    className="remove-entry-btn"
                    onClick={() => removeEntry(entry.id)}
                  >
                    Remove
                  </button>
                )}
              </div>
              
              <div className="entry-fields">
                <div className="form-group">
                  <label>Recipient Address:</label>
                  <input
                    type="text"
                    value={entry.address}
                    onChange={(e) => updateEntry(entry.id, 'address', e.target.value)}
                    placeholder="0x..."
                    className="address-input"
                  />
                </div>
                
                <div className="form-group">
                  <label>Amount:</label>
                  <input
                    type="number"
                    value={entry.amount}
                    onChange={(e) => updateEntry(entry.id, 'amount', e.target.value)}
                    placeholder="0.0"
                    step="0.01"
                    min="0"
                    className="amount-input"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="batch-controls">
          <button
            type="button"
            className="add-entry-btn"
            onClick={addEntry}
            disabled={transactionState.loading}
          >
            + Add Recipient
          </button>
        </div>

        <div className="batch-summary">
          <div className="summary-item">
            <label>Total Recipients:</label>
            <span>{entries.filter(entry => entry.address && entry.amount).length}</span>
          </div>
          <div className="summary-item">
            <label>Total Amount:</label>
            <span>{getTotalAmount().toFixed(6)} {tokenInfo.symbol}</span>
          </div>
        </div>

        <button
          type="submit"
          className="batch-submit-btn"
          disabled={!isFormValid()}
        >
          {transactionState.loading ? 'Processing Batch Transfer...' : 'Execute Batch Transfer'}
        </button>
      </form>

      <div className="batch-tips">
        <h4>Tips:</h4>
        <ul>
          <li>Batch transfers save gas fees compared to individual transfers</li>
          <li>All recipients must have valid Ethereum addresses</li>
          <li>Make sure you have enough tokens for the total amount</li>
          <li>Double-check all addresses before submitting</li>
        </ul>
      </div>
    </div>
  );
};

export default BatchTransfer;
