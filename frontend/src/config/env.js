const requiredEnvVars = [
  'REACT_APP_MASTER_CONTROL',
  'REACT_APP_RPC_URL',
  'REACT_APP_CHAIN_ID'
];

export const validateEnv = () => {
  const missing = requiredEnvVars.filter(
    varName => !process.env[varName]
  );

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }

  return {
    masterControlAddress: process.env.REACT_APP_MASTER_CONTROL,
    rpcUrl: process.env.REACT_APP_RPC_URL,
    chainId: parseInt(process.env.REACT_APP_CHAIN_ID, 10)
  };
}; 