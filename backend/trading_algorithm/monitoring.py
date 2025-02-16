import time
from typing import Dict, Any
from prometheus_client import start_http_server, Counter, Gauge, Histogram
import structlog
from datetime import datetime

# Configure structured logging
logger = structlog.get_logger()

# Prometheus metrics
TRADES_TOTAL = Counter('trades_total', 'Total number of trades executed')
TRADES_SUCCESS = Counter('trades_success', 'Number of successful trades')
TRADES_FAILED = Counter('trades_failed', 'Number of failed trades')
GAS_USED = Counter('gas_used_total', 'Total gas used for transactions')
TRADE_DURATION = Histogram('trade_duration_seconds', 'Time taken to execute trades')
PRICE_GAUGE = Gauge('current_price', 'Current token price')
VOLUME_GAUGE = Gauge('current_volume', 'Current token volume')
GAS_PRICE_GAUGE = Gauge('current_gas_price', 'Current gas price in Gwei')

class MonitoringService:
    def __init__(self, metrics_port: int = 8000):
        self.start_time = time.time()
        self.metrics: Dict[str, Any] = {
            'uptime_seconds': 0,
            'trades_total': 0,
            'trades_success': 0,
            'trades_failed': 0,
            'gas_used_total': 0,
            'average_trade_duration': 0
        }
        
        # Start Prometheus metrics server
        start_http_server(metrics_port)
        
        logger.info("monitoring_service_started",
                   metrics_port=metrics_port,
                   start_time=datetime.now().isoformat())

    def record_trade(self, success: bool, gas_used: int, duration: float):
        """Record trade metrics"""
        TRADES_TOTAL.inc()
        
        if success:
            TRADES_SUCCESS.inc()
            self.metrics['trades_success'] += 1
        else:
            TRADES_FAILED.inc()
            self.metrics['trades_failed'] += 1
            
        GAS_USED.inc(gas_used)
        TRADE_DURATION.observe(duration)
        
        self.metrics['trades_total'] += 1
        self.metrics['gas_used_total'] += gas_used
        
        # Update average duration
        total_trades = self.metrics['trades_total']
        current_avg = self.metrics['average_trade_duration']
        self.metrics['average_trade_duration'] = (
            (current_avg * (total_trades - 1) + duration) / total_trades
        )
        
        logger.info("trade_recorded",
                   success=success,
                   gas_used=gas_used,
                   duration=duration,
                   metrics=self.metrics)

    def update_price(self, price: float):
        """Update current price metric"""
        PRICE_GAUGE.set(price)
        logger.info("price_updated", price=price)

    def update_volume(self, volume: float):
        """Update current volume metric"""
        VOLUME_GAUGE.set(volume)
        logger.info("volume_updated", volume=volume)

    def update_gas_price(self, gas_price: int):
        """Update current gas price metric"""
        GAS_PRICE_GAUGE.set(gas_price)
        logger.info("gas_price_updated", gas_price=gas_price)

    def get_metrics(self) -> Dict[str, Any]:
        """Get current metrics"""
        self.metrics['uptime_seconds'] = int(time.time() - self.start_time)
        return self.metrics

    def log_error(self, error: Exception, context: Dict[str, Any] = None):
        """Log error with context"""
        logger.error("error_occurred",
                    error_type=type(error).__name__,
                    error_message=str(error),
                    context=context or {},
                    metrics=self.metrics)

    def log_warning(self, message: str, context: Dict[str, Any] = None):
        """Log warning with context"""
        logger.warning(message,
                      context=context or {},
                      metrics=self.metrics)

    def log_info(self, message: str, context: Dict[str, Any] = None):
        """Log info with context"""
        logger.info(message,
                   context=context or {},
                   metrics=self.metrics) 