export const validateEnv = () => {
  const requiredEnvVars = ['REACT_APP_API_URL', 'REACT_APP_CHAIN_ID'];
  requiredEnvVars.forEach((envVar) => {
    if (!process.env[envVar]) {
      throw new Error(`Missing environment variable: ${envVar}`);
    }
  });

  if (isNaN(Number(process.env.REACT_APP_CHAIN_ID))) {
    throw new Error('REACT_APP_CHAIN_ID must be a number');
  }
};
