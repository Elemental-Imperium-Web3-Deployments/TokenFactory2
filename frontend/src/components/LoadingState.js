import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import PropTypes from 'prop-types';

const LoadingState = ({ message = 'Loading...' }) => (
  <Box
    display="flex"
    flexDirection="column"
    alignItems="center"
    justifyContent="center"
    minHeight="200px"
  >
    <CircularProgress size={40} />
    <Typography variant="body1" color="textSecondary" sx={{ mt: 2 }}>
      {message}
    </Typography>
  </Box>
);

LoadingState.propTypes = {
  message: PropTypes.string
};

export default LoadingState; 