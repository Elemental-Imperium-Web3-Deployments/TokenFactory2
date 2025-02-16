import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { SUPPORTED_CHAINS } from '../config/web3';
import { handleWeb3Error } from '../utils/errors';

export const useWeb3 = (contractABI, contractAddress) => {
  const [account, setAccount] = useState('');
  const [contract, setContract] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const connectWallet = useCallback(async () => {
    try {
      if (!window.ethereum) {
        throw new Error('Please install MetaMask');
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const network = await provider.getNetwork();
      
      if (!SUPPORTED_CHAINS[network.chainId]) {
        throw new Error('Please switch to a supported network');
      }

      const accounts = await provider.send('eth_requestAccounts', []);
      const signer = provider.getSigner();
      const contractInstance = new ethers.Contract(contractAddress, contractABI, signer);

      setAccount(accounts[0]);
      setContract(contractInstance);
      setChainId(network.chainId);
      setError(null);
    } catch (err) {
      setError(handleWeb3Error(err));
    } finally {
      setLoading(false);
    }
  }, [contractABI, contractAddress]);

  return {
    account,
    contract,
    chainId,
    error,
    loading,
    connectWallet
  };
}; 