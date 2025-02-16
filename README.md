# Synthetic Stablecoin Platform

A decentralized platform for minting and managing synthetic stablecoins, built on Polygon with Chainlink price feeds.

## Features

- 🔒 Secure smart contract with role-based access control
- 💱 Real-time price feeds from Chainlink oracles
- 📊 Interactive dashboard for minting and burning tokens
- 📈 Price history visualization
- 🔄 Automated trading algorithm for price stability
- 📱 Responsive Material-UI frontend
- 📊 Analytics integration with Google Analytics
- 🐛 Error tracking with Sentry

## Project Structure

```
synthetic-stablecoin-project/
├── backend/               # Python trading algorithm
├── contracts/            # Solidity smart contracts
├── frontend/            # React frontend application
└── .github/             # GitHub Actions workflows
```

## Prerequisites

- Node.js >= 16
- Python >= 3.8
- Metamask wallet
- Tatum account (for RPC endpoint)
- Polygon RPC endpoint

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
- Fill in your configuration values:
  - Get your Tatum API key from https://dashboard.tatum.io
  - Set POLYGON_RPC_URL to https://api.tatum.io/v3/polygon/web3/YOUR_TATUM_API_KEY
  - Configure your private key and other variables

## Smart Contract Deployment

1. Deploy to Polygon:
```bash
cd contracts
npx hardhat run scripts/deploy.ts --network polygon
```

2. Verify on Polygonscan:
```bash
npx hardhat verify --network polygon DEPLOYED_CONTRACT_ADDRESS "Synthetic USD" "sUSD" PRICE_FEED_ADDRESS
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

## Testing

- Frontend tests:
```bash
cd frontend
npm test
```

- Smart contract tests:
```bash
cd contracts
npx hardhat test
```

## Deployment

The application is configured for automatic deployment to Vercel:

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Push to main branch to trigger deployment

## Monitoring

- View analytics in Google Analytics dashboard
- Monitor errors in Sentry dashboard
- Check contract activity on Polygonscan

## Security

- Smart contract audited by [Audit Firm]
- Role-based access control
- Pausable functionality
- Secure environment variable handling
- Regular security updates

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@your-domain.com or join our Discord channel.
