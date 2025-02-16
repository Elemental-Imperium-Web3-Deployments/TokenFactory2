import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ethers } from 'ethers';
import {
  Box,
  Button,
  Card,
  Container,
  Grid,
  TextField,
  Typography,
  CircularProgress,
} from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import MasterControlABI from '../contracts/MasterControl.json';
import PropTypes from 'prop-types';
import { ErrorBoundary } from 'react-error-boundary';
import { useWeb3 } from '../hooks/useWeb3';
import { useTransaction } from '../contexts/TransactionContext';
import Notification from './Notification';
import { PriceFeedService } from '../services/priceFeed';
import { useTransactionHandler } from '../hooks/useTransactionHandler';
import { usePriceData } from '../hooks/usePriceData';
import TransactionHistory from './TransactionHistory';

// Add error fallback component
const ErrorFallback = ({ error, resetErrorBoundary }) => (
  <Box display="flex" flexDirection="column" alignItems="center" p={3}>
    <Typography color="error" variant="h6" gutterBottom>
      Something went wrong:
    </Typography>
    <Typography color="error" variant="body1" gutterBottom>
      {error.message}
    </Typography>
    <Button variant="contained" onClick={resetErrorBoundary}>
      Try again
    </Button>
  </Box>
);

ErrorFallback.propTypes = {
  error: PropTypes.shape({
    message: PropTypes.string.isRequired
  }).isRequired,
  resetErrorBoundary: PropTypes.func.isRequired
};

const Dashboard = () => {
  // Use Web3 hook
  const {
    account,
    contract,
    chainId,
    error: web3Error,
    loading: web3Loading,
    connectWallet
  } = useWeb3(MasterControlABI.abi, process.env.REACT_APP_MASTER_CONTROL);

  // Use transaction context
  const { addTransaction, updateTransaction, pendingTx } = useTransaction();

  // Local state
  const [balance, setBalance] = useState('0');
  const [collateral, setCollateral] = useState('0');
  const [mintAmount, setMintAmount] = useState('');
  const [burnAmount, setBurnAmount] = useState('');
  const [priceHistory, setPriceHistory] = useState([]);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });

  // Initialize price feed service
  const priceFeed = useMemo(() => new PriceFeedService(
    new ethers.providers.JsonRpcProvider(process.env.REACT_APP_RPC_URL),
    process.env.REACT_APP_PRICE_FEED_ADDRESS
  ), []);

  const showNotification = useCallback((message, severity = 'info') => {
    setNotification({ open: true, message, severity });
  }, []);

  useEffect(() => {
    const loadPriceHistory = async () => {
      try {
        const history = await priceFeed.getPriceHistory();
        setPriceHistory(history);
      } catch (error) {
        showNotification('Error loading price history', 'error');
      }
    };

    loadPriceHistory();
  }, [priceFeed, showNotification, setPriceHistory]);

  const handleCloseNotification = useCallback(() => {
    setNotification(prev => ({ ...prev, open: false }));
  }, []);

  // Add hooks
  const handleTransaction = useTransactionHandler(
    (msg) => showNotification(msg, 'success'),
    (msg) => showNotification(msg, 'error')
  );

  const { 
    priceHistory: priceDataHistory,
  } = usePriceData(
    new ethers.providers.JsonRpcProvider(process.env.REACT_APP_RPC_URL),
    process.env.REACT_APP_PRICE_FEED_ADDRESS
  );

  // Update mint handler
  const handleMint = useCallback(async () => {
    if (!contract || !mintAmount) {
      return;
    }
    
    try {
      await handleTransaction(
        () => contract.mint(ethers.utils.parseEther(mintAmount)),
        {
          type: 'mint',
          amount: mintAmount,
          description: `Mint ${mintAmount} sUSD`
        }
      );
      setMintAmount('');
    } catch (error) {
      console.error(error);
    }
  }, [contract, mintAmount, handleTransaction, setMintAmount]);

  const handleBurn = useCallback(async () => {
    if (!contract || !burnAmount) {
      return;
    }
    
    try {
      await handleTransaction(
        () => contract.burn(ethers.utils.parseEther(burnAmount)),
        {
          type: 'burn',
          amount: burnAmount,
          description: `Burn ${burnAmount} sUSD`
        }
      );
      setBurnAmount('');
    } catch (error) {
      console.error(error);
    }
  }, [contract, burnAmount, handleTransaction, setBurnAmount]);

  const handleMintAmountChange = useCallback(({ target: { value } }) => {
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setMintAmount(value);
    }
  }, []);

  const handleBurnAmountChange = useCallback(({ target: { value } }) => {
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setBurnAmount(value);
    }
  }, []);

  if (web3Loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (web3Error) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" p={3}>
        <Typography color="error" variant="h6" gutterBottom>
          {web3Error}
        </Typography>
        <Button variant="contained" onClick={connectWallet}>
          Try Again
        </Button>
      </Box>
    );
  }

  // Memoize price history data transformation
  const formattedPriceHistory = useMemo(() => 
    priceDataHistory.map(({ time, price }) => ({
      time,
      price: parseFloat(price.toFixed(2))
    }))
  , [priceDataHistory]);

  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => window.location.reload()}
    >
      <Container maxWidth="lg">
        <Box sx={{ mt: 4, mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Synthetic Stablecoin Dashboard
          </Typography>
          
          <Grid container spacing={3}>
            {/* Balance Card */}
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Your Balance
                </Typography>
                <Typography variant="h4">
                  {web3Loading ? <CircularProgress size={24} /> : `${balance} sUSD`}
                </Typography>
              </Card>
            </Grid>

            {/* Collateral Card */}
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Your Collateral
                </Typography>
                <Typography variant="h4">
                  {web3Loading ? <CircularProgress size={24} /> : `${collateral} ETH`}
                </Typography>
              </Card>
            </Grid>

            {/* Price Chart */}
            <Grid item xs={12}>
              <Card sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Price History
                </Typography>
                <LineChart width={800} height={300} data={formattedPriceHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="price" stroke="#8884d8" />
                </LineChart>
              </Card>
            </Grid>

            {/* Mint Form */}
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Mint sUSD
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    label="Amount"
                    type="number"
                    value={mintAmount}
                    onChange={handleMintAmountChange}
                    disabled={web3Loading}
                    fullWidth
                  />
                  <Button
                    variant="contained"
                    onClick={handleMint}
                    disabled={web3Loading || !mintAmount}
                  >
                    Mint
                  </Button>
                </Box>
              </Card>
            </Grid>

            {/* Burn Form */}
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Burn sUSD
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    label="Amount"
                    type="number"
                    value={burnAmount}
                    onChange={handleBurnAmountChange}
                    disabled={web3Loading}
                    fullWidth
                  />
                  <Button
                    variant="contained"
                    onClick={handleBurn}
                    disabled={web3Loading || !burnAmount}
                  >
                    Burn
                  </Button>
                </Box>
              </Card>
            </Grid>
          </Grid>
        </Box>
        
        {/* Add notification component */}
        <Notification
          open={notification.open}
          message={notification.message}
          severity={notification.severity}
          onClose={handleCloseNotification}
        />
        
        {/* Add pending transaction indicator */}
        {pendingTx && (
          <Box position="fixed" bottom={16} right={16}>
            <CircularProgress size={24} />
            <Typography variant="body2" ml={1}>
              Transaction pending...
            </Typography>
          </Box>
        )}

        <TransactionHistory />
      </Container>
    </ErrorBoundary>
  );
};

export default Dashboard;