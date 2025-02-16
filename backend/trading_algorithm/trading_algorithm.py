import os
import time
import json
import logging
import asyncio
from decimal import Decimal
import pandas as pd
from typing import Dict, Tuple, Optional
from dotenv import load_dotenv
from tatum_utils import TatumProvider
from datetime import datetime, timedelta
from circuit_breaker import CircuitBreaker
from trade_optimizer import TradeOptimizer
from monitoring import MonitoringService
import orjson
import pytz

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

class TradingAlgorithm:
    def __init__(self):
        # Initialize services
        self.tatum = TatumProvider()
        self.w3 = self.tatum.get_web3_provider()
        self.circuit_breaker = CircuitBreaker()
        self.trade_optimizer = TradeOptimizer()
        self.monitoring = MonitoringService()
        
        # Load configuration
        self.private_key = os.getenv('PRIVATE_KEY')
        self.master_control_address = os.getenv('MASTER_CONTROL_ADDRESS')
        self.webhook_url = os.getenv('WEBHOOK_URL')
        
        # Load ABI
        with open('MasterControl.json') as f:
            contract_json = orjson.loads(f.read())
            self.contract_abi = contract_json['abi']
        
        self.contract = self.w3.eth.contract(
            address=self.master_control_address,
            abi=self.contract_abi
        )
        
        self.price_history: Dict[int, Decimal] = {}
        self.account = self.w3.eth.account.from_key(self.private_key)
        self.last_trade_time: Optional[datetime] = None
        self.min_trade_interval = timedelta(minutes=5)
        
        # Initialize timezone
        self.timezone = pytz.timezone('UTC')
        
    async def get_current_price(self) -> Decimal:
        """Get current price from Chainlink oracle"""
        try:
            price = await asyncio.to_thread(
                self.contract.functions.getLatestPrice().call
            )
            return Decimal(price) / Decimal(1e8)
        except Exception as e:
            self.monitoring.log_error(e, {'method': 'get_current_price'})
            raise
            
    def calculate_trade_size(self, price: Decimal, volume: Decimal) -> Tuple[Decimal, bool]:
        """
        Calculate optimal trade size based on price and volume
        Returns (size, is_mint) where is_mint is True for minting, False for burning
        """
        target_price = Decimal('1.00')  # Target $1 USD
        price_deviation = abs(price - target_price)
        
        # Calculate base trade size as percentage of volume
        base_size = volume * Decimal('0.01')  # 1% of volume
        
        # Adjust size based on deviation
        adjusted_size = base_size * (price_deviation * Decimal('10'))
        
        # Cap maximum trade size
        max_trade = volume * Decimal('0.05')  # 5% of volume
        trade_size = min(adjusted_size, max_trade)
        
        # Determine if we should mint or burn
        should_mint = price < target_price
        
        return trade_size, should_mint
        
    def execute_trade(self, size: Decimal, is_mint: bool):
        """Execute mint or burn transaction"""
        try:
            # Convert to Wei
            amount_wei = int(size * Decimal(1e18))
            
            # Build transaction
            if is_mint:
                tx = self.contract.functions.mint(amount_wei)
            else:
                tx = self.contract.functions.burn(amount_wei)
            
            # Get transaction data
            tx_data = tx.build_transaction()['data']
            
            # Estimate gas using Tatum
            gas_limit = self.tatum.estimate_gas(
                self.account.address,
                self.master_control_address,
                tx_data
            )
            
            # Get current gas price and nonce from Tatum
            gas_price = self.tatum.get_gas_price()
            nonce = self.tatum.get_nonce(self.account.address)
            
            # Build transaction
            transaction = {
                'from': self.account.address,
                'to': self.master_control_address,
                'nonce': nonce,
                'gas': gas_limit,
                'gasPrice': gas_price,
                'data': tx_data
            }
            
            # Sign transaction
            signed_tx = self.w3.eth.account.sign_transaction(transaction, self.private_key)
            
            # Broadcast via Tatum
            tx_hash = self.tatum.broadcast_signed_transaction(signed_tx.rawTransaction.hex())
            
            # Wait for receipt
            receipt = None
            while not receipt:
                receipt = self.tatum.get_transaction_receipt(tx_hash)
                if not receipt:
                    time.sleep(1)
            
            logger.info(f"{'Mint' if is_mint else 'Burn'} transaction successful: {tx_hash}")
            return receipt
            
        except Exception as e:
            logger.error(f"Error executing trade: {e}")
            raise
            
    async def handle_price_update(self, data: dict):
        """Handle real-time price updates"""
        try:
            price = Decimal(data['price']) / Decimal(1e8)
            current_time = int(time.time())
            
            # Update monitoring
            self.monitoring.update_price(float(price))
            
            # Update circuit breaker
            self.circuit_breaker.add_price_data(price)
            
            # Store price history
            self.price_history[current_time] = price
            
            # Check circuit breaker
            should_break, reason = self.circuit_breaker.should_break_circuit()
            if should_break:
                self.monitoring.log_warning(
                    "Circuit breaker activated",
                    {'reason': reason}
                )
                return
            
            # Check if we should trade
            if await self.should_execute_trade(price):
                volume = Decimal(
                    await asyncio.to_thread(
                        self.contract.functions.totalSupply().call
                    )
                ) / Decimal(1e18)
                
                self.monitoring.update_volume(float(volume))
                self.circuit_breaker.add_volume_data(volume)
                
                trade_size, should_mint = self.calculate_trade_size(price, volume)
                
                if trade_size >= Decimal('100'):
                    await self.execute_trade_async(trade_size, should_mint)
                    
        except Exception as e:
            self.monitoring.log_error(e, {'method': 'handle_price_update'})
            
    async def should_execute_trade(self, current_price: Decimal) -> bool:
        """Determine if we should execute a trade based on conditions"""
        if not self.last_trade_time:
            return True
            
        time_since_last_trade = datetime.now(self.timezone) - self.last_trade_time
        if time_since_last_trade < self.min_trade_interval:
            return False
            
        target_price = Decimal('1.00')
        price_deviation = abs(current_price - target_price)
        
        return price_deviation >= Decimal('0.01')
        
    async def execute_trade_async(self, size: Decimal, is_mint: bool):
        """Execute trade asynchronously with optimization"""
        start_time = time.time()
        
        try:
            # Get trade optimization
            splits, gas_price, wait_time = await self.trade_optimizer.optimize_trade_execution(
                size,
                max_wait=300
            )
            
            if wait_time > 0:
                self.monitoring.log_info(
                    "Waiting for optimal trade window",
                    {'wait_time': wait_time, 'gas_price': gas_price}
                )
                await asyncio.sleep(wait_time)
            
            # Execute splits
            for split_size in splits:
                receipt = await asyncio.to_thread(
                    self.execute_trade,
                    split_size,
                    is_mint,
                    gas_price
                )
                
                if receipt:
                    self.monitoring.record_trade(
                        success=True,
                        gas_used=receipt['gasUsed'],
                        duration=time.time() - start_time
                    )
                    self.last_trade_time = datetime.now(self.timezone)
                    self.circuit_breaker.record_trade()
                    
        except Exception as e:
            self.monitoring.record_trade(
                success=False,
                gas_used=0,
                duration=time.time() - start_time
            )
            self.monitoring.log_error(e, {
                'method': 'execute_trade_async',
                'size': str(size),
                'is_mint': is_mint
            })
            
    async def monitor_metrics(self):
        """Monitor and log performance metrics"""
        while True:
            try:
                # Get circuit breaker status
                cb_status = self.circuit_breaker.get_status()
                
                # Log comprehensive status
                self.monitoring.log_info(
                    "System status update",
                    {
                        'circuit_breaker': cb_status,
                        'metrics': self.monitoring.get_metrics()
                    }
                )
                
                # Check for warning conditions
                metrics = self.monitoring.get_metrics()
                if metrics['trades_failed'] > 0:
                    failure_rate = metrics['trades_failed'] / metrics['trades_total']
                    if failure_rate > 0.1:
                        self.monitoring.log_warning(
                            "High trade failure rate",
                            {'failure_rate': f"{failure_rate:.2%}"}
                        )
                        
            except Exception as e:
                self.monitoring.log_error(e, {'method': 'monitor_metrics'})
                
            await asyncio.sleep(300)
            
    async def cleanup_old_data(self):
        """Clean up old price history and metrics"""
        while True:
            try:
                current_time = int(time.time())
                self.price_history = {
                    k: v for k, v in self.price_history.items()
                    if current_time - k <= 86400
                }
            except Exception as e:
                self.monitoring.log_error(e, {'method': 'cleanup_old_data'})
                
            await asyncio.sleep(3600)
            
    async def run_async(self):
        """Main async trading loop"""
        try:
            # Set up monitoring
            self.tatum.monitor_address(self.master_control_address, self.webhook_url)
            
            # Subscribe to price updates
            await self.tatum.subscribe_to_events(
                ['PRICE_UPDATE', 'BLOCK_MINED'],
                self.handle_price_update
            )
            
            # Start all background tasks
            await asyncio.gather(
                self.tatum.start_websocket_listener(),
                self.monitor_metrics(),
                self.cleanup_old_data()
            )
            
        except Exception as e:
            self.monitoring.log_error(e, {'method': 'run_async'})
            raise
            
    def run(self):
        """Entry point for the trading algorithm"""
        try:
            asyncio.run(self.run_async())
        except Exception as e:
            self.monitoring.log_error(e, {'method': 'run'})
            raise

if __name__ == "__main__":
    algorithm = TradingAlgorithm()
    algorithm.run() 