export const handleWeb3Error = (error) => {
  let errorMessage = 'An unknown error occurred';

  if (error.code === 4001) {
    errorMessage = 'User rejected the transaction';
  } else if (error.code === -32000) {
    errorMessage = 'Insufficient funds';
  } else if (error.message.includes('network')) {
    errorMessage = 'Network error, please try again later';
  }

  return errorMessage;
};
