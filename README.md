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

- Node.js >= 16
- Python >= 3.8
- Metamask wallet
- Tatum account (for RPC endpoint and infrastructure)
- Polygon RPC endpoint

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

3. Configure Tatum monitoring:

```bash
node deployment/setup-monitoring.js
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
