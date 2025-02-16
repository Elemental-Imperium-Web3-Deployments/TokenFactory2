import { useCallback } from 'react';
import { useTransaction } from '../contexts/TransactionContext';
import { handleWeb3Error } from '../utils/errors';

export const useTransactionHandler = (onSuccess, onError) => {
  const { addTransaction, updateTransaction } = useTransaction();

  const handleTransaction = useCallback(async (
    transactionFn,
    { type, amount, description }
  ) => {
    try {
      const tx = await transactionFn();
      
      addTransaction({
        hash: tx.hash,
        type,
        amount,
        description,
        status: 'pending',
        timestamp: Date.now()
      });

      const receipt = await tx.wait();
      
      updateTransaction(tx.hash, 'completed');
      onSuccess?.(`${type} transaction successful`);
      
      return receipt;
    } catch (error) {
      const errorMessage = handleWeb3Error(error);
      onError?.(errorMessage);
      throw error;
    }
  }, [addTransaction, updateTransaction, onSuccess, onError]);

  return handleTransaction;
}; 