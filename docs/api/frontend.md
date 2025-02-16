# Frontend API Reference

This document details the API for the Synthetic Stablecoin Platform's frontend application.

## Overview

The frontend is a React-based application providing a user interface for interacting with the synthetic stablecoin platform.

## Components

### 1. Dashboard Component

Main component displaying trading interface and metrics.

```jsx
const Dashboard = () => {
    // Component implementation
}
```

#### State Management

```typescript
interface DashboardState {
    loading: boolean;
    account: string;
    contract: Contract | null;
    balance: string;
    collateral: string;
    mintAmount: string;
    burnAmount: string;
    priceHistory: PriceDataPoint[];
}

interface PriceDataPoint {
    time: string;
    price: number;
}
```

#### Key Methods

##### loadData

```typescript
const loadData = async (
    contractInstance: Contract,
    userAccount: string
) => void
```

Loads user data and price history.

##### handleMint

```typescript
const handleMint = async () => void
```

Handles token minting operations.

##### handleBurn

```typescript
const handleBurn = async () => void
```

Handles token burning operations.

### 2. Analytics Component

Handles Google Analytics integration.

```jsx
const Analytics = ({ children }) => {
    // Component implementation
}
```

#### Event Tracking

```typescript
interface TrackEvent {
    category: string;
    action: string;
    label: string;
}

const trackEvent = (category: string, action: string, label: string) => void
```

### 3. Error Boundary

Sentry integration for error tracking.

```jsx
import { SentryErrorBoundary } from './utils/sentry';

<SentryErrorBoundary fallback={<p>An error has occurred</p>}>
    {/* Application components */}
</SentryErrorBoundary>
```

## Smart Contract Integration

### Contract Initialization

```javascript
const initContract = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contractAddress = process.env.REACT_APP_MASTER_CONTROL;
    return new ethers.Contract(
        contractAddress,
        MasterControlABI.abi,
        signer
    );
};
```

### Transaction Handling

```javascript
const sendTransaction = async (method, params) => {
    try {
        const tx = await contract[method](...params);
        await tx.wait();
        return tx;
    } catch (error) {
        logError(error);
        throw error;
    }
};
```

## API Endpoints

### Price Data

```typescript
interface PriceResponse {
    price: string;
    timestamp: string;
}

const getPriceHistory = async (): Promise<PriceResponse[]> => {
    const response = await fetch('/api/price-history');
    return response.json();
};
```

### User Data

```typescript
interface UserData {
    balance: string;
    collateral: string;
    transactions: Transaction[];
}

interface Transaction {
    hash: string;
    type: 'mint' | 'burn';
    amount: string;
    timestamp: string;
}

const getUserData = async (address: string): Promise<UserData> => {
    const response = await fetch(`/api/user/${address}`);
    return response.json();
};
```

## Theme Configuration

```javascript
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
```

## Analytics Integration

### Google Analytics

```javascript
const initGA = () => {
    const measurementId = process.env.REACT_APP_GA_MEASUREMENT_ID;
    if (measurementId) {
        ReactGA.initialize(measurementId);
    }
};

const trackPageView = () => {
    ReactGA.send({
        hitType: "pageview",
        page: window.location.pathname + window.location.search
    });
};
```

### Sentry Integration

```javascript
const initSentry = () => {
    if (process.env.REACT_APP_SENTRY_DSN) {
        Sentry.init({
            dsn: process.env.REACT_APP_SENTRY_DSN,
            integrations: [new BrowserTracing()],
            tracesSampleRate: 1.0,
            environment: process.env.NODE_ENV,
        });
    }
};
```

## Environment Variables

```env
REACT_APP_MASTER_CONTROL=deployed_contract_address
REACT_APP_GA_MEASUREMENT_ID=google_analytics_id
REACT_APP_SENTRY_DSN=sentry_dsn
REACT_APP_VERSION=app_version
```

## Error Handling

### Error Types

```typescript
interface AppError extends Error {
    code?: string;
    context?: any;
}

const handleError = (error: AppError) => {
    logError(error);
    // Show user-friendly error message
};
```

### Common Errors

1. **Wallet Connection**
   ```javascript
   try {
       await window.ethereum.request({
           method: 'eth_requestAccounts'
       });
   } catch (error) {
       handleError({
           ...error,
           context: 'wallet_connection'
       });
   }
   ```

2. **Transaction Errors**
   ```javascript
   try {
       await handleMint();
   } catch (error) {
       handleError({
           ...error,
           context: 'mint_transaction'
       });
   }
   ```

## Performance Optimization

1. **Code Splitting**
   ```javascript
   const Dashboard = React.lazy(() => import('./components/Dashboard'));
   ```

2. **Memoization**
   ```javascript
   const MemoizedChart = React.memo(PriceChart);
   ```

3. **Resource Loading**
   ```javascript
   const preloadContract = () => {
       const link = document.createElement('link');
       link.rel = 'preload';
       link.as = 'script';
       link.href = '/contract-abi.json';
       document.head.appendChild(link);
   };
   ```

## Security Considerations

1. **Input Validation**
   ```javascript
   const validateAmount = (amount: string): boolean => {
       const value = parseFloat(amount);
       return !isNaN(value) && value > 0;
   };
   ```

2. **Transaction Signing**
   ```javascript
   const signTransaction = async (tx: any) => {
       const signer = provider.getSigner();
       return await signer.signTransaction(tx);
   };
   ```

3. **Error Boundaries**
   ```javascript
   class AppErrorBoundary extends React.Component {
       componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
           logError(error, errorInfo);
       }
   }
   ``` 