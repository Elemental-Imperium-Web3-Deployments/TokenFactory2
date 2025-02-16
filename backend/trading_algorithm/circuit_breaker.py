from decimal import Decimal
from typing import Optional, List
from datetime import datetime, timedelta
import numpy as np
from dataclasses import dataclass

@dataclass
class VolatilityMetrics:
    current_volatility: float
    price_change_rate: float
    volume_change_rate: float
    trade_frequency: float

class CircuitBreaker:
    def __init__(self):
        self.price_history: List[tuple[datetime, Decimal]] = []
        self.volume_history: List[tuple[datetime, Decimal]] = []
        self.trade_history: List[datetime] = []
        self.last_break_time: Optional[datetime] = None
        self.is_active = False
        
        # Thresholds
        self.volatility_threshold = 0.05  # 5% price volatility
        self.price_change_threshold = 0.10  # 10% price change
        self.volume_change_threshold = 0.20  # 20% volume change
        self.trade_frequency_threshold = 10  # trades per minute
        self.cool_down_period = timedelta(minutes=15)
        
    def add_price_data(self, price: Decimal, timestamp: Optional[datetime] = None):
        """Add price data point"""
        if timestamp is None:
            timestamp = datetime.now()
        self.price_history.append((timestamp, price))
        self._cleanup_old_data()
        
    def add_volume_data(self, volume: Decimal, timestamp: Optional[datetime] = None):
        """Add volume data point"""
        if timestamp is None:
            timestamp = datetime.now()
        self.volume_history.append((timestamp, volume))
        self._cleanup_old_data()
        
    def record_trade(self, timestamp: Optional[datetime] = None):
        """Record trade execution"""
        if timestamp is None:
            timestamp = datetime.now()
        self.trade_history.append(timestamp)
        self._cleanup_old_data()
        
    def _cleanup_old_data(self):
        """Remove data older than 1 hour"""
        cutoff_time = datetime.now() - timedelta(hours=1)
        
        self.price_history = [
            (t, p) for t, p in self.price_history 
            if t > cutoff_time
        ]
        self.volume_history = [
            (t, v) for t, v in self.volume_history 
            if t > cutoff_time
        ]
        self.trade_history = [
            t for t in self.trade_history 
            if t > cutoff_time
        ]
        
    def _calculate_metrics(self) -> VolatilityMetrics:
        """Calculate current market metrics"""
        now = datetime.now()
        recent_window = timedelta(minutes=5)
        
        # Calculate price volatility
        recent_prices = [
            float(p) for t, p in self.price_history 
            if now - t <= recent_window
        ]
        volatility = np.std(recent_prices) / np.mean(recent_prices) if recent_prices else 0
        
        # Calculate price change rate
        if len(self.price_history) >= 2:
            latest_price = float(self.price_history[-1][1])
            earliest_price = float(self.price_history[0][1])
            price_change = abs(latest_price - earliest_price) / earliest_price
        else:
            price_change = 0
            
        # Calculate volume change rate
        if len(self.volume_history) >= 2:
            latest_volume = float(self.volume_history[-1][1])
            earliest_volume = float(self.volume_history[0][1])
            volume_change = abs(latest_volume - earliest_volume) / earliest_volume
        else:
            volume_change = 0
            
        # Calculate trade frequency (trades per minute)
        recent_trades = [
            t for t in self.trade_history 
            if now - t <= recent_window
        ]
        trade_frequency = len(recent_trades) / 5  # per minute
        
        return VolatilityMetrics(
            current_volatility=volatility,
            price_change_rate=price_change,
            volume_change_rate=volume_change,
            trade_frequency=trade_frequency
        )
        
    def should_break_circuit(self) -> tuple[bool, Optional[str]]:
        """Determine if circuit breaker should be activated"""
        if self.is_active:
            if self.last_break_time and datetime.now() - self.last_break_time >= self.cool_down_period:
                self.is_active = False
                return False, None
            return True, "Circuit breaker is active"
            
        metrics = self._calculate_metrics()
        
        # Check thresholds
        if metrics.current_volatility > self.volatility_threshold:
            self._activate_circuit_breaker()
            return True, f"High volatility detected: {metrics.current_volatility:.2%}"
            
        if metrics.price_change_rate > self.price_change_threshold:
            self._activate_circuit_breaker()
            return True, f"Excessive price change: {metrics.price_change_rate:.2%}"
            
        if metrics.volume_change_rate > self.volume_change_threshold:
            self._activate_circuit_breaker()
            return True, f"Excessive volume change: {metrics.volume_change_rate:.2%}"
            
        if metrics.trade_frequency > self.trade_frequency_threshold:
            self._activate_circuit_breaker()
            return True, f"High trade frequency: {metrics.trade_frequency:.1f} trades/min"
            
        return False, None
        
    def _activate_circuit_breaker(self):
        """Activate the circuit breaker"""
        self.is_active = True
        self.last_break_time = datetime.now()
        
    def get_status(self) -> dict:
        """Get current circuit breaker status"""
        metrics = self._calculate_metrics()
        return {
            'is_active': self.is_active,
            'last_break_time': self.last_break_time.isoformat() if self.last_break_time else None,
            'metrics': {
                'volatility': f"{metrics.current_volatility:.2%}",
                'price_change': f"{metrics.price_change_rate:.2%}",
                'volume_change': f"{metrics.volume_change_rate:.2%}",
                'trade_frequency': f"{metrics.trade_frequency:.1f} trades/min"
            },
            'thresholds': {
                'volatility': f"{self.volatility_threshold:.2%}",
                'price_change': f"{self.price_change_threshold:.2%}",
                'volume_change': f"{self.volume_change_threshold:.2%}",
                'trade_frequency': f"{self.trade_frequency_threshold} trades/min"
            }
        } 