import React, { createContext, useContext, useState, useCallback } from 'react';
import PropTypes from 'prop-types';

const TransactionContext = createContext(null);

export const TransactionProvider = ({ children }) => {
  const [pendingTx, setPendingTx] = useState(null);
  const [txHistory, setTxHistory] = useState([]);

  const addTransaction = useCallback((tx) => {
    setPendingTx(tx);
    setTxHistory(prev => [...prev, { ...tx, timestamp: Date.now() }]);
  }, []);

  const updateTransaction = useCallback((hash, status) => {
    setTxHistory(prev => 
      prev.map(tx => 
        tx.hash === hash ? { ...tx, status } : tx
      )
    );
    if (pendingTx?.hash === hash) {
      setPendingTx(null);
    }
  }, [pendingTx]);

  return (
    <TransactionContext.Provider value={{
      pendingTx,
      txHistory,
      addTransaction,
      updateTransaction
    }}>
      {children}
    </TransactionContext.Provider>
  );
};

TransactionProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useTransaction = () => {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error('useTransaction must be used within a TransactionProvider');
  }
  return context;
}; 