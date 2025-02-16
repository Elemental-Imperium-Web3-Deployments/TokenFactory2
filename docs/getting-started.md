# Getting Started

This guide will help you set up and run the Synthetic Stablecoin Platform on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js >= 16
- Python >= 3.8
- Metamask wallet
- Git
- Code editor (VSCode recommended)

## Required Accounts

1. **Tatum Account**
   - Sign up at [https://dashboard.tatum.io](https://dashboard.tatum.io)
   - Generate API key from the dashboard
   - Note your API key for later use

2. **Polygon Network**
   - Set up Metamask for Polygon network
   - Get some MATIC tokens for gas fees
   - Add Polygon Mumbai testnet for development

## Installation

1. **Clone the Repository**

```bash
git clone https://github.com/yourusername/synthetic-stablecoin-project.git
cd synthetic-stablecoin-project
```

2. **Install Dependencies**

Frontend dependencies:
```bash
cd frontend
npm install
```

Backend dependencies:
```bash
cd ../backend
pip install -r requirements.txt
```

Smart contract dependencies:
```bash
cd ../contracts
npm install
```

3. **Environment Setup**

Create and configure environment files:

Root directory `.env`:
```env
TATUM_API_KEY=your_api_key
POLYGON_RPC_URL=https://api.tatum.io/v3/polygon/web3/YOUR_API_KEY
PRIVATE_KEY=your_wallet_private_key
MASTER_CONTROL_ADDRESS=deployed_contract_address
```

Frontend `.env`:
```env
REACT_APP_MASTER_CONTROL=deployed_contract_address
REACT_APP_GA_MEASUREMENT_ID=your_ga_id
REACT_APP_SENTRY_DSN=your_sentry_dsn
```

## Configuration

### 1. Tatum Setup

Configure Tatum monitoring:

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

### 2. Smart Contract Deployment

Deploy the smart contract:

```bash
cd contracts
npx hardhat run scripts/deploy.ts --network polygon
```

Verify on Polygonscan:

```bash
npx hardhat verify --network polygon DEPLOYED_CONTRACT_ADDRESS "Synthetic USD" "sUSD" PRICE_FEED_ADDRESS
```

### 3. Trading Algorithm Configuration

Update the trading algorithm configuration in `backend/trading_algorithm/config.py`:

```python
TRADING_CONFIG = {
    'min_trade_interval': 300,  # 5 minutes
    'max_trade_size': 1000,
    'gas_price_strategy': 'medium',
    'monitoring_port': 8000
}
```

## Running the Application

1. **Start the Frontend**

```bash
cd frontend
npm start
```

The frontend will be available at `http://localhost:3000`

2. **Start the Trading Algorithm**

```bash
cd backend
python trading_algorithm.py
```

3. **Monitor the Application**

- Check frontend console for React logs
- Monitor trading algorithm logs in the terminal
- View metrics at `http://localhost:8000/metrics`
- Check Tatum dashboard for blockchain activity

## Next Steps

- Review the [Architecture Documentation](architecture/README.md)
- Set up [Monitoring](monitoring/README.md)
- Configure [Security Features](security/README.md)
- Join our [Discord Community](https://discord.gg/your-discord)

## Troubleshooting

If you encounter issues:

1. Check the [Common Issues](troubleshooting/common-issues.md) guide
2. Review the logs in `backend/logs` and browser console
3. Join our Discord for community support
4. Create a GitHub issue for bugs

## Development Tips

1. Use the Mumbai testnet for development
2. Enable debug logging in the trading algorithm
3. Use the React Developer Tools browser extension
4. Monitor gas prices using the Tatum dashboard 