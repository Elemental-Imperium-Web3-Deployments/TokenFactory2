import React from 'react';
import ReactDOM from 'react-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { initSentry, SentryErrorBoundary } from './utils/sentry';
import Analytics from './components/Analytics';
import App from './App';

// Initialize Sentry
initSentry();

// Create Material-UI theme
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
});

ReactDOM.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SentryErrorBoundary fallback={<p>An error has occurred</p>}>
        <Analytics>
          <App />
        </Analytics>
      </SentryErrorBoundary>
    </ThemeProvider>
  </React.StrictMode>,
  document.getElementById('root')
); 