from decimal import Decimal
from typing import Optional, List, Tuple
from datetime import datetime, timedelta
import numpy as np
from dataclasses import dataclass
import asyncio

@dataclass
class GasStrategy:
    base_gas_price: int
    max_gas_price: int
    priority_multiplier: float
    wait_time: int  # seconds

@dataclass
class TradeWindow:
    start_time: datetime
    end_time: datetime
    optimal_size: Decimal
    estimated_gas: int
    confidence: float

class TradeOptimizer:
    def __init__(self):
        self.gas_history: List[Tuple[datetime, int]] = []
        self.trade_windows: List[TradeWindow] = []
        self.min_confidence = 0.7
        
        # Gas price strategies
        self.gas_strategies = {
            'low': GasStrategy(30, 50, 1.0, 300),    # 5 min wait
            'medium': GasStrategy(40, 70, 1.2, 120),  # 2 min wait
            'high': GasStrategy(50, 100, 1.5, 30),    # 30 sec wait
            'urgent': GasStrategy(70, 150, 2.0, 0)    # No wait
        }
        
    def add_gas_price(self, gas_price: int, timestamp: Optional[datetime] = None):
        """Record gas price observation"""
        if timestamp is None:
            timestamp = datetime.now()
        self.gas_history.append((timestamp, gas_price))
        self._cleanup_old_data()
        
    def _cleanup_old_data(self):
        """Remove data older than 24 hours"""
        cutoff_time = datetime.now() - timedelta(hours=24)
        self.gas_history = [
            (t, g) for t, g in self.gas_history 
            if t > cutoff_time
        ]
        
    def _get_gas_percentiles(self) -> Tuple[int, int, int]:
        """Get 25th, 50th, and 75th percentile gas prices"""
        recent_gas = [g for _, g in self.gas_history[-100:]]  # Last 100 observations
        if not recent_gas:
            return 40, 50, 70  # Default values
            
        return tuple(int(x) for x in np.percentile(recent_gas, [25, 50, 75]))
        
    def get_optimal_gas_price(self, urgency: str = 'medium') -> int:
        """Calculate optimal gas price based on history and urgency"""
        if urgency not in self.gas_strategies:
            urgency = 'medium'
            
        strategy = self.gas_strategies[urgency]
        p25, p50, p75 = self._get_gas_percentiles()
        
        # Base price calculation
        if urgency == 'low':
            base_price = p25
        elif urgency == 'medium':
            base_price = p50
        else:
            base_price = p75
            
        # Apply strategy
        gas_price = max(
            strategy.base_gas_price,
            min(
                strategy.max_gas_price,
                int(base_price * strategy.priority_multiplier)
            )
        )
        
        return gas_price
        
    async def find_optimal_trade_window(self, 
                                      size: Decimal,
                                      time_range: timedelta = timedelta(minutes=15)
                                      ) -> Optional[TradeWindow]:
        """Find optimal trading window based on historical data"""
        now = datetime.now()
        window_end = now + time_range
        
        # Get recent gas trends
        recent_gas = [
            (t, g) for t, g in self.gas_history 
            if t >= now - timedelta(hours=1)
        ]
        
        if not recent_gas:
            return None
            
        # Analyze gas price patterns
        gas_times = np.array([(t.hour * 60 + t.minute) for t, _ in recent_gas])
        gas_prices = np.array([g for _, g in recent_gas])
        
        # Find local minima in gas prices
        smooth_prices = np.convolve(gas_prices, np.ones(5)/5, mode='valid')
        local_mins = (smooth_prices[1:-1] < smooth_prices[:-2]) & (smooth_prices[1:-1] < smooth_prices[2:])
        
        if not any(local_mins):
            # No clear optimal window found
            return TradeWindow(
                start_time=now,
                end_time=now + timedelta(minutes=5),
                optimal_size=size,
                estimated_gas=self.get_optimal_gas_price('medium'),
                confidence=0.5
            )
            
        # Find best window
        best_window = None
        best_confidence = 0
        
        for i in range(len(local_mins)):
            if local_mins[i]:
                window_start = datetime.now() + timedelta(minutes=int(gas_times[i]))
                if window_start > window_end:
                    continue
                    
                # Calculate confidence based on gas price stability
                local_volatility = np.std(gas_prices[max(0, i-5):min(len(gas_prices), i+6)])
                confidence = 1.0 - (local_volatility / np.mean(gas_prices))
                
                if confidence > best_confidence:
                    best_confidence = confidence
                    best_window = TradeWindow(
                        start_time=window_start,
                        end_time=window_start + timedelta(minutes=5),
                        optimal_size=size,
                        estimated_gas=int(gas_prices[i]),
                        confidence=confidence
                    )
                    
        return best_window
        
    def should_split_trade(self, size: Decimal, gas_price: int) -> List[Decimal]:
        """Determine if trade should be split for gas optimization"""
        if size < Decimal('1000'):  # Don't split small trades
            return [size]
            
        gas_cost = gas_price * 21000  # Basic transaction gas
        trade_value = float(size)
        
        # Calculate optimal split based on gas costs
        if trade_value > gas_cost * 10:  # Only split if value justifies gas costs
            num_splits = min(5, int(trade_value / (gas_cost * 5)))  # Max 5 splits
            split_size = size / Decimal(num_splits)
            return [split_size for _ in range(num_splits)]
            
        return [size]
        
    async def optimize_trade_execution(self, 
                                     size: Decimal,
                                     max_wait: int = 300  # 5 minutes
                                     ) -> Tuple[List[Decimal], int, int]:
        """Optimize trade execution strategy"""
        # Find optimal window
        window = await self.find_optimal_trade_window(
            size,
            time_range=timedelta(seconds=max_wait)
        )
        
        if not window or window.confidence < self.min_confidence:
            # Immediate execution with current gas price
            gas_price = self.get_optimal_gas_price('medium')
            splits = self.should_split_trade(size, gas_price)
            return splits, gas_price, 0
            
        # Calculate wait time
        wait_time = int((window.start_time - datetime.now()).total_seconds())
        splits = self.should_split_trade(size, window.estimated_gas)
        
        return splits, window.estimated_gas, wait_time 