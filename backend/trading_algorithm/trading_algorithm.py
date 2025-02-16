import os
import time
import json
import logging
from web3 import Web3
from decimal import Decimal
import pandas as pd
from typing import Dict, Tuple
import requests
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

class TradingAlgorithm:
    def __init__(self):
        # Initialize Web3 with Tatum provider
        provider_url = os.getenv('POLYGON_RPC_URL')
        tatum_api_key = os.getenv('TATUM_API_KEY')
        
        # Create custom provider with Tatum headers
        provider = Web3.HTTPProvider(
            provider_url,
            request_kwargs={
                'headers': {
                    'x-api-key': tatum_api_key
                }
            }
        )
        self.w3 = Web3(provider)
        
        self.private_key = os.getenv('PRIVATE_KEY')
        self.master_control_address = os.getenv('MASTER_CONTROL_ADDRESS')
        
        # Load ABI
        with open('MasterControl.json') as f:
            contract_json = json.load(f)
            self.contract_abi = contract_json['abi']
        
        self.contract = self.w3.eth.contract(
            address=self.master_control_address,
            abi=self.contract_abi
        )
        
        self.price_history: Dict[int, Decimal] = {}
        
    def get_current_price(self) -> Decimal:
        """Get current price from Chainlink oracle"""
        try:
            price = self.contract.functions.getLatestPrice().call()
            return Decimal(price) / Decimal(1e8)  # Chainlink prices have 8 decimals
        except Exception as e:
            logger.error(f"Error getting price: {e}")
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
                
            # Get gas estimate
            gas_estimate = tx.estimateGas({'from': self.w3.eth.account.from_key(self.private_key).address})
            
            # Build and sign transaction
            transaction = tx.buildTransaction({
                'from': self.w3.eth.account.from_key(self.private_key).address,
                'nonce': self.w3.eth.get_transaction_count(self.w3.eth.account.from_key(self.private_key).address),
                'gas': gas_estimate,
                'gasPrice': self.w3.eth.gas_price
            })
            
            signed_tx = self.w3.eth.account.sign_transaction(transaction, self.private_key)
            
            # Send transaction
            tx_hash = self.w3.eth.send_raw_transaction(signed_tx.rawTransaction)
            receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)
            
            logger.info(f"{'Mint' if is_mint else 'Burn'} transaction successful: {receipt.transactionHash.hex()}")
            return receipt
            
        except Exception as e:
            logger.error(f"Error executing trade: {e}")
            raise
            
    def run(self):
        """Main trading loop"""
        while True:
            try:
                # Get current price and volume
                current_price = self.get_current_price()
                volume = Decimal(self.contract.functions.totalSupply().call()) / Decimal(1e18)
                
                # Store price history
                self.price_history[int(time.time())] = current_price
                
                # Calculate trade size
                trade_size, should_mint = self.calculate_trade_size(current_price, volume)
                
                # Execute trade if size is significant
                min_trade_size = Decimal('100')  # Minimum $100 trade
                if trade_size >= min_trade_size:
                    self.execute_trade(trade_size, should_mint)
                
                # Clean up old price history (keep last 24 hours)
                current_time = int(time.time())
                self.price_history = {
                    k: v for k, v in self.price_history.items()
                    if current_time - k <= 86400
                }
                
                # Sleep for 5 minutes
                time.sleep(300)
                
            except Exception as e:
                logger.error(f"Error in main loop: {e}")
                time.sleep(60)  # Wait 1 minute on error
                
if __name__ == "__main__":
    algorithm = TradingAlgorithm()
    algorithm.run() 