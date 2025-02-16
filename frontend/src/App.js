import React, { useEffect } from 'react';
import { Box, AppBar, Toolbar, Typography, Container } from '@mui/material';
import { TransactionProvider } from './contexts/TransactionContext';
import Dashboard from './components/Dashboard';
import { validateEnv } from './config/env';
import { ThemeProvider } from '@mui/material/styles';
import { createAppTheme } from './theme';

const App = () => {
  const theme = createAppTheme('light'); // or use state for dark mode toggle

  useEffect(() => {
    // Validate environment variables on app startup
    try {
      validateEnv();
    } catch (error) {
      console.error('Environment validation failed:', error);
      // You might want to show an error UI here
    }
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <TransactionProvider>
        <Box sx={{ flexGrow: 1 }}>
          <AppBar position="static">
            <Toolbar>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                Synthetic Stablecoin Platform
              </Typography>
            </Toolbar>
          </AppBar>
          
          <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Dashboard />
          </Container>
          
          <Box
            component="footer"
            sx={{
              py: 3,
              px: 2,
              mt: 'auto',
              backgroundColor: (theme) =>
                theme.palette.mode === 'light'
                  ? theme.palette.grey[200]
                  : theme.palette.grey[800],
            }}
          >
            <Container maxWidth="lg">
              <Typography variant="body2" color="text.secondary" align="center">
                © {new Date().getFullYear()} Synthetic Stablecoin Platform. All rights reserved.
              </Typography>
            </Container>
          </Box>
        </Box>
      </TransactionProvider>
    </ThemeProvider>
  );
};

export default App; 