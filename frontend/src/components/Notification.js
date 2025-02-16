import React from 'react';
import { Snackbar, Alert } from '@mui/material';
import PropTypes from 'prop-types';

const Notification = ({ open, message, severity, onClose }) => (
  <Snackbar open={open} autoHideDuration={6000} onClose={onClose}>
    <Alert onClose={onClose} severity={severity} sx={{ width: '100%' }}>
      {message}
    </Alert>
  </Snackbar>
);

Notification.propTypes = {
  open: PropTypes.bool.isRequired,
  message: PropTypes.string.isRequired,
  severity: PropTypes.oneOf(['error', 'warning', 'info', 'success']).isRequired,
  onClose: PropTypes.func.isRequired,
};

export default Notification; 