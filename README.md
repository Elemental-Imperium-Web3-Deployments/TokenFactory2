# Synthetic Stablecoin Platform

A decentralized platform for minting and managing synthetic stablecoins, built on Polygon with Chainlink price feeds and Tatum infrastructure.

## Features

- 🔒 Secure smart contract with role-based access control
- 💱 Real-time price feeds from Chainlink oracles
- 📊 Interactive dashboard for minting and burning tokens
- 📈 Price history visualization
- 🔄 Automated trading algorithm for price stability
- 📱 Responsive Material-UI frontend
- 📊 Analytics integration with Google Analytics
- 🐛 Error tracking with Sentry
- ⚡ Tatum Infrastructure Integration:
  - Optimized RPC endpoints
  - Transaction monitoring
  - Gas price optimization
  - Automated blockchain indexing
  - WebSocket support for real-time updates

## Project Structure

```text
synthetic-stablecoin-project/
├── backend/               # Python trading algorithm
│   └── trading_algorithm/
│       ├── trading_algorithm.py
│       ├── tatum_utils.py
│       └── requirements.txt
├── contracts/            # Solidity smart contracts
├── deployment/          # Deployment configurations
│   └── tatum-config.js
├── frontend/            # React frontend application
└── .github/             # GitHub Actions workflows
```

## Prerequisites

### Development Environment
- Node.js >= 18.0.0
- npm >= 9.0.0 or Yarn >= 1.22.0
- Git >= 2.38.0
- Visual Studio Code (recommended) or any modern IDE
- Chrome >= 88 or Firefox >= 87 with MetaMask extension

### Network Requirements
- Stable internet connection
- Access to Polygon RPC endpoints
- MetaMask wallet with MATIC tokens for gas
- Access to IPFS gateway (for decentralized storage)

### System Requirements
- Operating System:
  - Windows 10/11 (with WSL2 for optimal performance)
  - macOS 10.15+ (Intel or Apple Silicon)
  - Ubuntu 20.04+ or other modern Linux distributions
- Memory: Minimum 8GB RAM (16GB recommended)
- Storage: At least 1GB free space
- CPU: Modern dual-core processor (quad-core recommended)

### Blockchain Requirements
- MetaMask wallet
- MATIC tokens for:
  - Contract deployment
  - Transaction fees
  - Testing
- Access to Polygon networks:
  - Mumbai Testnet (for development)
  - Polygon Mainnet (for production)

### API Keys and Services
1. **Polygon RPC Provider**
   - Account at [Alchemy](https://www.alchemy.com/) or [Infura](https://infura.io/)
   - API key with access to Polygon networks
   - Websocket endpoint access

2. **Price Feed Services**
   - Chainlink Price Feed contract addresses
   - Access to aggregator contracts
   - Oracle node connection details

3. **Development Tools**
   - Etherscan API key for contract verification
   - IPFS node access or Pinata API key
   - Tenderly API key (optional, for debugging)

### Security Requirements
- OpenSSL >= 1.1.1
- SSH key pair for GitHub
- GPG key for signing commits
- Secure key management solution

### CI/CD Requirements
- GitHub account with repository access
- Access to GitHub Actions
- Vercel account (or similar deployment platform)
- Environment secrets configured

### Testing Environment
- Hardhat or Truffle for smart contract testing
- Jest for frontend testing
- Cypress for E2E testing
- Ganache for local blockchain

### Documentation
- Solidity >= 0.8.0 documentation
- Web3.js or Ethers.js documentation
- React documentation
- Material-UI documentation

## Detailed Setup Instructions

### 1. Environment Setup

#### Windows Setup
```bash
# Install Node.js
winget install OpenJS.NodeJS

# Install Git
winget install Git.Git

# Install Python (required for some node modules)
winget install Python.Python.3
```

#### macOS Setup
```bash
# Install Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install dependencies
brew install node
brew install git
brew install python@3
```

#### Linux Setup
```bash
# Update package manager
sudo apt update
sudo apt upgrade

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install development tools
sudo apt-get install -y build-essential git python3
```

### 2. Project Setup

```bash
# Clone repository
git clone https://github.com/yourusername/synthetic-stablecoin-project.git
cd synthetic-stablecoin-project

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
```

### 3. Environment Variables

```env
# Network Configuration
REACT_APP_CHAIN_ID=137
REACT_APP_RPC_URL=your_rpc_url
REACT_APP_WSS_URL=your_websocket_url

# Contract Addresses
REACT_APP_MASTER_CONTROL=your_contract_address
REACT_APP_PRICE_FEED_ADDRESS=your_price_feed_address

# API Keys
REACT_APP_ETHERSCAN_API_KEY=your_etherscan_key
REACT_APP_IPFS_PROJECT_ID=your_ipfs_project_id
REACT_APP_IPFS_PROJECT_SECRET=your_ipfs_secret

# Feature Flags
REACT_APP_ENABLE_TESTNET=true
REACT_APP_ENABLE_LOGGING=true
```

### 4. Network Configuration

#### Mumbai Testnet
- Network Name: Mumbai Testnet
- RPC URL: https://rpc-mumbai.maticvigil.com/
- Chain ID: 80001
- Currency Symbol: MATIC
- Block Explorer: https://mumbai.polygonscan.com/

#### Polygon Mainnet
- Network Name: Polygon Mainnet
- RPC URL: https://polygon-rpc.com/
- Chain ID: 137
- Currency Symbol: MATIC
- Block Explorer: https://polygonscan.com/

### 5. Development Tools Setup

#### VS Code Extensions
- Solidity
- ESLint
- Prettier
- GitLens
- Error Lens
- Material Icon Theme

#### Browser Extensions
- MetaMask
- React Developer Tools
- Redux DevTools

### 6. Testing Setup

```bash
# Install global dependencies
npm install -g hardhat-shorthand
npm install -g ganache

# Run tests
npm run test:contracts    # Smart contract tests
npm run test:react       # Frontend tests
npm run test:e2e        # End-to-end tests
```

### 7. Deployment Prerequisites

#### Contract Deployment
- Private key with sufficient MATIC
- Verified contract source code
- Properly configured constructor arguments
- Gas price strategy

#### Frontend Deployment
- Vercel account configured
- Environment variables set
- Build optimization settings
- CDN configuration

### 8. Monitoring Setup

- Sentry.io account
- Google Analytics configuration
- Tenderly dashboard
- Polygon network scanner

### 9. Security Considerations

- Wallet backup
- Private key management
- API key rotation policy
- Rate limiting configuration
- CORS settings

## Tatum Setup

1. Create a Tatum account at [https://dashboard.tatum.io](https://dashboard.tatum.io)
2. Generate API key in the dashboard
3. Configure rate limits and monitoring:

```bash
curl -X POST "https://api.tatum.io/v3/subscription" \
-H "x-api-key: YOUR_API_KEY" \
-H "Content-Type: application/json" \
-d '{
  "type": "MONITOR_ADDRESS",
  "attr": {
    "address": "YOUR_CONTRACT_ADDRESS",
    "chain": "MATIC",
    "url": "YOUR_WEBHOOK_URL"
  }
}'
```

## Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/synthetic-stablecoin-project.git
cd synthetic-stablecoin-project
```

2. Install frontend dependencies:

```bash
cd frontend
npm install
```

3. Install Python dependencies:

```bash
cd ../backend
pip install -r requirements.txt
```

4. Set up environment variables:
   - Copy `.env.example` to `.env` in the root directory
   - Copy `frontend/.env.example` to `frontend/.env`
   - Configure your Tatum credentials:

```env
TATUM_API_KEY=your_api_key
POLYGON_RPC_URL=https://api.tatum.io/v3/polygon/web3/YOUR_API_KEY
```

## Deployment Guide

### 1. Smart Contract Deployment
```bash
# 1. Compile contracts
npx hardhat compile

# 2. Run deployment script
npx hardhat run scripts/deploy.ts --network polygon

# 3. Verify contract
npx hardhat verify --network polygon \
  DEPLOYED_CONTRACT_ADDRESS \
  "Constructor Arg 1" \
  "Constructor Arg 2"

# 4. Update environment variables
echo "REACT_APP_CONTRACT_ADDRESS=0x..." >> .env
```

### 2. Frontend Deployment
```bash
# 1. Install dependencies
npm ci

# 2. Build optimized bundle
npm run build

# 3. Analyze bundle size
npm run analyze

# 4. Deploy to Vercel
vercel deploy --prod
```

### 3. Environment Configuration
```bash
# Production environment variables
REACT_APP_CHAIN_ID=137
REACT_APP_RPC_URL=https://polygon-rpc.com
REACT_APP_WSS_URL=wss://polygon-ws.com

# Staging environment variables
REACT_APP_CHAIN_ID=80001
REACT_APP_RPC_URL=https://rpc-mumbai.matic.today
REACT_APP_WSS_URL=wss://ws-mumbai.matic.today
```

## Running the Application

1. Start the frontend:

```bash
cd frontend
npm start
```

2. Start the trading algorithm:

```bash
cd backend
python trading_algorithm.py
```

## Tatum Features

### Transaction Monitoring
- Real-time transaction monitoring
- Webhook notifications for contract events
- Automated gas price optimization
- Failed transaction tracking

### Performance Optimization
- Dedicated RPC nodes
- WebSocket support for real-time updates
- Automatic failover
- Rate limiting protection

### Security Features
- API key rotation
- IP whitelisting
- Request signing
- Rate limiting

## Testing

Run frontend tests:

```bash
cd frontend
npm test
```

Run smart contract tests:

```bash
cd contracts
npx hardhat test
```

## Deployment

The application is configured for automatic deployment to Vercel with Tatum integration:

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard:
   - `TATUM_API_KEY`
   - `POLYGON_RPC_URL`
   - Other required variables
3. Push to main branch to trigger deployment

## Monitoring

- View analytics in Google Analytics dashboard
- Monitor errors in Sentry dashboard
- Check contract activity on Polygonscan
- Monitor blockchain activity in Tatum dashboard:
  - Transaction history
  - Gas usage
  - Contract events
  - Network status

## Security

- Smart contract audited by [Audit Firm]
- Role-based access control
- Pausable functionality
- Secure environment variable handling
- Regular security updates
- Tatum security features:
  - API key rotation
  - Request signing
  - IP whitelisting

## Troubleshooting

### Common Issues

1. RPC Connection Issues:

```bash
curl -X GET "https://api.tatum.io/v3/polygon/info" \
-H "x-api-key: YOUR_API_KEY"
```

2. Rate Limiting:
   - Check current usage in Tatum dashboard
   - Implement exponential backoff
   - Use WebSocket connection for real-time data

3. Transaction Failures:
   - Monitor gas prices
   - Check transaction status
   - Verify contract state

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Support

- Technical issues: Create a GitHub issue
- Smart contract questions: Join our Discord
- Tatum integration: Contact Tatum support
- General support: support@your-domain.com

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Development Setup

### Environment Variables
Required variables:
```env
REACT_APP_MASTER_CONTROL=<contract_address>
REACT_APP_CHAIN_ID=137
REACT_APP_RPC_URL=<polygon_rpc_url>
```

### Local Development
1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

### Testing
```bash
# Run unit tests
npm test

# Run E2E tests
npm run test:e2e

# Run with coverage
npm run test:coverage
```

## Architecture

### Smart Contract Integration
The dashboard connects to the MasterControl smart contract which handles:
- Minting synthetic USD
- Burning tokens
- Collateral management
- Price feed integration

### Component Structure
- `Dashboard.js`: Main interface for user interactions
- Error boundaries for graceful error handling
- Web3 integration with MetaMask
- Real-time price updates via WebSocket

## Deployment

### Production Builds
```bash
npm run build
```

### CI/CD Pipeline
Automated deployment via GitHub Actions:
1. Build and test
2. Deploy to staging
3. Deploy to production

## Performance Optimization

### 1. React Optimization
```javascript
// Use React.memo for expensive components
const PriceChart = React.memo(({ data }) => {
  // Component implementation
}, (prevProps, nextProps) => {
  return JSON.stringify(prevProps.data) === JSON.stringify(nextProps.data);
});

// Implement virtual scrolling for large lists
import { FixedSizeList } from 'react-window';
const VirtualizedList = ({ items }) => (
  <FixedSizeList
    height={400}
    width={600}
    itemCount={items.length}
    itemSize={50}
  >
    {({ index, style }) => (
      <div style={style}>{items[index]}</div>
    )}
  </FixedSizeList>
);
```

### 2. Web3 Optimization
```javascript
// Implement caching for Web3 calls
const cachedWeb3Calls = new Map();
const getCachedBalance = async (address) => {
  const cacheKey = `balance-${address}`;
  if (cachedWeb3Calls.has(cacheKey)) {
    const { value, timestamp } = cachedWeb3Calls.get(cacheKey);
    if (Date.now() - timestamp < 30000) return value;
  }
  const balance = await contract.balanceOf(address);
  cachedWeb3Calls.set(cacheKey, {
    value: balance,
    timestamp: Date.now()
  });
  return balance;
};
```

### 3. Bundle Optimization
```javascript
// Configure code splitting
const Dashboard = React.lazy(() => import('./components/Dashboard'));
const TransactionHistory = React.lazy(() => import('./components/TransactionHistory'));

// Configure chunk optimization in webpack
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      minSize: 20000,
      maxSize: 70000,
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    },
  },
};
```

## Development Guidelines

### Code Style
- Use ESLint and Prettier
- Follow React best practices
- Implement proper TypeScript types

## Testing Strategy

### 1. Unit Testing
```javascript
// Example component test
describe('Dashboard Component', () => {
  it('should handle mint transaction', async () => {
    const { getByTestId, queryByText } = render(<Dashboard />);
    
    // Mock Web3 provider
    const mockProvider = new MockProvider();
    await act(async () => {
      fireEvent.change(getByTestId('mint-amount'), {
        target: { value: '100' }
      });
      fireEvent.click(getByTestId('mint-button'));
    });
    
    expect(queryByText('Transaction pending')).toBeInTheDocument();
  });
});
```

### 2. Integration Testing
```javascript
// Example Web3 integration test
describe('Web3 Integration', () => {
  let provider;
  let contract;
  
  beforeEach(async () => {
    provider = new ethers.providers.JsonRpcProvider();
    contract = new ethers.Contract(address, abi, provider);
  });
  
  it('should mint tokens', async () => {
    const tx = await contract.mint(parseEther('100'));
    await tx.wait();
    const balance = await contract.balanceOf(account);
    expect(balance).to.equal(parseEther('100'));
  });
});
```

### 3. E2E Testing
```javascript
// Example Cypress test
describe('Dashboard E2E', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.connectMetaMask();
  });
  
  it('should complete minting flow', () => {
    cy.get('[data-testid=mint-amount]')
      .type('100');
    cy.get('[data-testid=mint-button]')
      .click();
    cy.get('[data-testid=transaction-status]')
      .should('contain', 'completed');
  });
});
```
````
