import React from 'react';
import {
  Box,
  Card,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Link
} from '@mui/material';
import { useTransaction } from '../contexts/TransactionContext';
import { SUPPORTED_CHAINS } from '../config/web3';

const TransactionHistory = () => {
  const { txHistory } = useTransaction();
  const chainId = process.env.REACT_APP_CHAIN_ID;
  const explorer = SUPPORTED_CHAINS[chainId]?.blockExplorer;

  if (!txHistory.length) {
    return (
      <Box p={3}>
        <Typography color="textSecondary">
          No transactions yet
        </Typography>
      </Box>
    );
  }

  return (
    <Card>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Type</TableCell>
            <TableCell>Amount</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Time</TableCell>
            <TableCell>Hash</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {txHistory.map((tx) => (
            <TableRow key={tx.hash}>
              <TableCell>{tx.type}</TableCell>
              <TableCell>{tx.amount}</TableCell>
              <TableCell>{tx.status}</TableCell>
              <TableCell>
                {new Date(tx.timestamp).toLocaleString()}
              </TableCell>
              <TableCell>
                <Link 
                  href={`${explorer}/tx/${tx.hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {tx.hash.substring(0, 8)}...
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
};

export default TransactionHistory; 