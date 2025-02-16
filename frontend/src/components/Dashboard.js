import React, { useState, useEffect } from 'react';
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

const Dashboard = () => {
  const [loading, setLoading] = useState(false);
  const [account, setAccount] = useState('');
  const [contract, setContract] = useState(null);
  const [balance, setBalance] = useState('0');
  const [collateral, setCollateral] = useState('0');
  const [mintAmount, setMintAmount] = useState('');
  const [burnAmount, setBurnAmount] = useState('');
  const [priceHistory, setPriceHistory] = useState([]);

  useEffect(() => {
    const init = async () => {
      if (typeof window.ethereum !== 'undefined') {
        try {
          // Request account access
          const accounts = await window.ethereum.request({
            method: 'eth_requestAccounts',
          });
          setAccount(accounts[0]);

          // Create ethers provider and contract instance
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = provider.getSigner();
          const contractAddress = process.env.REACT_APP_MASTER_CONTROL;
          const masterControl = new ethers.Contract(
            contractAddress,
            MasterControlABI.abi,
            signer
          );
          setContract(masterControl);

          // Load initial data
          await loadData(masterControl, accounts[0]);
        } catch (error) {
          console.error('Error initializing:', error);
        }
      }
    };

    init();
  }, []);

  const loadData = async (contractInstance, userAccount) => {
    try {
      setLoading(true);
      const balanceWei = await contractInstance.balanceOf(userAccount);
      const collateralWei = await contractInstance.collateralBalances(userAccount);
      
      setBalance(ethers.utils.formatEther(balanceWei));
      setCollateral(ethers.utils.formatEther(collateralWei));
      
      // Load price history (last 24 hours)
      const currentTime = Math.floor(Date.now() / 1000);
      const history = [];
      
      for (let i = 0; i < 24; i++) {
        const price = await contractInstance.getLatestPrice();
        history.unshift({
          time: new Date(currentTime - i * 3600 * 1000).toLocaleTimeString(),
          price: parseFloat(ethers.utils.formatUnits(price, 8)),
        });
      }
      
      setPriceHistory(history);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMint = async () => {
    if (!contract || !mintAmount) return;
    
    try {
      setLoading(true);
      const tx = await contract.mint(ethers.utils.parseEther(mintAmount));
      await tx.wait();
      await loadData(contract, account);
      setMintAmount('');
    } catch (error) {
      console.error('Error minting:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBurn = async () => {
    if (!contract || !burnAmount) return;
    
    try {
      setLoading(true);
      const tx = await contract.burn(ethers.utils.parseEther(burnAmount));
      await tx.wait();
      await loadData(contract, account);
      setBurnAmount('');
    } catch (error) {
      console.error('Error burning:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
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
                {loading ? <CircularProgress size={24} /> : `${balance} sUSD`}
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
                {loading ? <CircularProgress size={24} /> : `${collateral} ETH`}
              </Typography>
            </Card>
          </Grid>

          {/* Price Chart */}
          <Grid item xs={12}>
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Price History
              </Typography>
              <LineChart width={800} height={300} data={priceHistory}>
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
                  onChange={(e) => setMintAmount(e.target.value)}
                  disabled={loading}
                  fullWidth
                />
                <Button
                  variant="contained"
                  onClick={handleMint}
                  disabled={loading || !mintAmount}
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
                  onChange={(e) => setBurnAmount(e.target.value)}
                  disabled={loading}
                  fullWidth
                />
                <Button
                  variant="contained"
                  onClick={handleBurn}
                  disabled={loading || !burnAmount}
                >
                  Burn
                </Button>
              </Box>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Dashboard; 