export const WEB3_ERRORS = {
  USER_REJECTED: 4001,
  INSUFFICIENT_FUNDS: -32000,
  INTERNAL_ERROR: -32603,
};

export const handleWeb3Error = (error) => {
  switch (error.code) {
    case WEB3_ERRORS.USER_REJECTED:
      return 'Transaction rejected by user';
    case WEB3_ERRORS.INSUFFICIENT_FUNDS:
      return 'Insufficient funds for transaction';
    case WEB3_ERRORS.INTERNAL_ERROR:
      return 'Network error, please try again';
    default:
      return error.message || 'Transaction failed';
  }
}; 