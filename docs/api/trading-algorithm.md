# Trading Algorithm API Reference

This document details the API for the Synthetic Stablecoin Platform's trading algorithm.

## Overview

The trading algorithm is a Python-based system that maintains price stability through automated trading operations.

## Components

### 1. TradingAlgorithm Class

Main class managing trading operations.

```python
class TradingAlgorithm:
    def __init__(self):
        """Initialize trading algorithm with required services and configurations."""
```

#### Key Methods

##### run

```python
def run(self):
    """Entry point for the trading algorithm."""
```

Starts the trading algorithm and monitors price movements.

##### run_async

```python
async def run_async(self):
    """Main async trading loop."""
```

Manages the asynchronous trading operations.

##### handle_price_update

```python
async def handle_price_update(self, data: dict):
    """Handle real-time price updates."""
```

Parameters:
- `data`: Dictionary containing price update information

##### execute_trade_async

```python
async def execute_trade_async(self, size: Decimal, is_mint: bool):
    """Execute trade asynchronously with optimization."""
```

Parameters:
- `size`: Trade size in tokens
- `is_mint`: Boolean indicating mint (True) or burn (False)

### 2. CircuitBreaker Class

Manages risk and prevents excessive trading during volatile conditions.

```python
class CircuitBreaker:
    def __init__(self):
        """Initialize circuit breaker with default thresholds."""
```

#### Key Methods

##### should_break_circuit

```python
def should_break_circuit(self) -> tuple[bool, Optional[str]]:
    """Determine if circuit breaker should be activated."""
```

Returns:
- Tuple of (should_break: bool, reason: Optional[str])

##### add_price_data

```python
def add_price_data(self, price: Decimal, timestamp: Optional[datetime] = None):
    """Add price data point for analysis."""
```

Parameters:
- `price`: Current price
- `timestamp`: Optional timestamp (defaults to now)

### 3. TradeOptimizer Class

Optimizes trade execution for gas and timing.

```python
class TradeOptimizer:
    def __init__(self):
        """Initialize trade optimizer."""
```

#### Key Methods

##### optimize_trade_execution

```python
async def optimize_trade_execution(
    self,
    size: Decimal,
    max_wait: int = 300
) -> Tuple[List[Decimal], int, int]:
    """Optimize trade execution strategy."""
```

Parameters:
- `size`: Trade size to optimize
- `max_wait`: Maximum wait time in seconds

Returns:
- Tuple of (split_sizes: List[Decimal], gas_price: int, wait_time: int)

### 4. MonitoringService Class

Handles metrics and monitoring.

```python
class MonitoringService:
    def __init__(self, metrics_port: int = 8000):
        """Initialize monitoring service."""
```

#### Key Methods

##### record_trade

```python
def record_trade(self, success: bool, gas_used: int, duration: float):
    """Record trade metrics."""
```

Parameters:
- `success`: Whether trade was successful
- `gas_used`: Gas used for transaction
- `duration`: Trade execution duration

##### log_error

```python
def log_error(self, error: Exception, context: Dict[str, Any] = None):
    """Log error with context."""
```

Parameters:
- `error`: Exception object
- `context`: Additional context information

## Configuration

### Environment Variables

```env
TATUM_API_KEY=your_api_key
POLYGON_RPC_URL=https://api.tatum.io/v3/polygon/web3/YOUR_API_KEY
PRIVATE_KEY=your_wallet_private_key
MASTER_CONTROL_ADDRESS=deployed_contract_address
```

### Trading Configuration

```python
TRADING_CONFIG = {
    'min_trade_interval': 300,  # 5 minutes
    'max_trade_size': 1000,
    'gas_price_strategy': 'medium',
    'monitoring_port': 8000
}
```

## Metrics

### Prometheus Metrics

```python
TRADES_TOTAL = Counter('trades_total', 'Total number of trades executed')
TRADES_SUCCESS = Counter('trades_success', 'Number of successful trades')
TRADES_FAILED = Counter('trades_failed', 'Number of failed trades')
GAS_USED = Counter('gas_used_total', 'Total gas used for transactions')
TRADE_DURATION = Histogram('trade_duration_seconds', 'Time taken to execute trades')
PRICE_GAUGE = Gauge('current_price', 'Current token price')
VOLUME_GAUGE = Gauge('current_volume', 'Current token volume')
GAS_PRICE_GAUGE = Gauge('current_gas_price', 'Current gas price in Gwei')
```

## WebSocket Events

### Price Updates

```python
{
    "type": "PRICE_UPDATE",
    "price": "1000000000",  # 8 decimal places
    "timestamp": "2024-01-20T12:00:00Z"
}
```

### Block Updates

```python
{
    "type": "BLOCK_MINED",
    "blockNumber": "12345678",
    "timestamp": "2024-01-20T12:00:00Z"
}
```

## Integration Examples

### Starting the Algorithm

```python
from trading_algorithm import TradingAlgorithm

algorithm = TradingAlgorithm()
algorithm.run()
```

### Custom Price Handler

```python
async def custom_price_handler(data: dict):
    price = Decimal(data['price']) / Decimal(1e8)
    # Custom price handling logic
    await algorithm.handle_price_update({'price': price})

# Subscribe to price updates
await algorithm.tatum.subscribe_to_events(
    ['PRICE_UPDATE'],
    custom_price_handler
)
```

## Error Handling

### Common Errors

1. **Connection Errors**
   ```python
   try:
       await algorithm.run_async()
   except websockets.exceptions.ConnectionClosed:
       # Handle connection error
   ```

2. **Transaction Errors**
   ```python
   try:
       await algorithm.execute_trade_async(size, is_mint)
   except Exception as e:
       algorithm.monitoring.log_error(e, {
           'method': 'execute_trade_async',
           'size': str(size),
           'is_mint': is_mint
       })
   ```

## Performance Optimization

1. **Async Operations**
   - Use `asyncio` for non-blocking operations
   - Implement connection pooling
   - Handle WebSocket reconnections

2. **Memory Management**
   - Regular cleanup of old data
   - Efficient data structures
   - Memory monitoring

3. **Error Recovery**
   - Automatic retry mechanisms
   - Circuit breaker protection
   - Graceful degradation

## Security Considerations

1. **API Security**
   - Secure key management
   - Rate limiting
   - Request signing

2. **Data Validation**
   - Input sanitization
   - Price validation
   - Transaction verification

3. **Monitoring**
   - Real-time alerts
   - Error tracking
   - Performance monitoring 