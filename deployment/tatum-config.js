const tatumConfig = {
    // Network configurations
    networks: {
        polygon: {
            mainnet: {
                url: process.env.POLYGON_RPC_URL,
                apiKey: process.env.TATUM_API_KEY,
                chainId: 137
            },
            testnet: {
                url: 'https://api.tatum.io/v3/polygon/web3/YOUR_API_KEY',
                apiKey: process.env.TATUM_API_KEY,
                chainId: 80001
            }
        }
    },

    // Gas settings
    gas: {
        price: {
            safe: 40, // Gwei
            fast: 50,
            fastest: 60
        },
        limit: {
            mint: 200000,
            burn: 150000,
            transfer: 65000
        }
    },

    // Rate limiting
    rateLimit: {
        maxRequestsPerSecond: 5,
        maxRequestsPerMinute: 250
    },

    // Webhook configurations
    webhooks: {
        transactionMonitoring: {
            url: process.env.TRANSACTION_WEBHOOK_URL,
            type: 'POST'
        }
    },

    // Error handling
    errorHandling: {
        retryAttempts: 3,
        retryDelay: 1000, // ms
        timeoutDuration: 30000 // ms
    },

    // Monitoring
    monitoring: {
        enabled: true,
        interval: 60000, // Check every minute
        alertThresholds: {
            gasPrice: 100, // Gwei
            failedTransactions: 3,
            pendingTransactions: 10
        }
    }
};

module.exports = tatumConfig; 