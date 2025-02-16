export const SUPPORTED_CHAINS = {
  137: {
    name: 'Polygon Mainnet',
    rpcUrl: process.env.REACT_APP_RPC_URL,
    blockExplorer: 'https://polygonscan.com',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
  },
  // Add other networks as needed
};

export const getWeb3Config = (chainId) => {
  const config = SUPPORTED_CHAINS[chainId];
  if (!config) {
    throw new Error(`Chain ID ${chainId} not supported`);
  }
  return config;
}; 