import os
import json
import asyncio
import websockets
from web3 import Web3
from typing import Optional, Callable, Dict, Any
import requests
from dotenv import load_dotenv
import backoff
from datetime import datetime, timedelta

load_dotenv()

class TatumProvider:
    def __init__(self):
        self.api_key = os.getenv('TATUM_API_KEY')
        self.base_url = "https://api.tatum.io/v3"
        self.ws_url = "wss://ws.tatum.io/v3/polygon"
        self.headers = {
            'x-api-key': self.api_key,
            'Content-Type': 'application/json'
        }
        self.rate_limits: Dict[str, datetime] = {}
        self.websocket = None
        self.subscribers: Dict[str, list[Callable]] = {}

    @backoff.on_exception(backoff.expo, 
                         (requests.exceptions.RequestException, ValueError),
                         max_tries=5)
    def _make_request(self, method: str, endpoint: str, **kwargs) -> Any:
        """Make HTTP request with rate limiting and retries"""
        # Check rate limits
        now = datetime.now()
        if endpoint in self.rate_limits:
            time_passed = now - self.rate_limits[endpoint]
            if time_passed < timedelta(milliseconds=200):  # 5 requests per second
                asyncio.sleep(0.2 - time_passed.total_seconds())
        
        url = f"{self.base_url}/{endpoint}"
        response = requests.request(method, url, headers=self.headers, **kwargs)
        self.rate_limits[endpoint] = now
        
        response.raise_for_status()
        return response.json()

    def get_web3_provider(self) -> Web3:
        """Create Web3 provider with Tatum configuration"""
        provider = Web3.HTTPProvider(
            f"{self.base_url}/polygon/web3/{self.api_key}",
            request_kwargs={'headers': self.headers}
        )
        return Web3(provider)

    def get_gas_price(self) -> int:
        """Get current gas price from Tatum"""
        data = self._make_request('GET', 'polygon/gas')
        return int(data['gasPrice'])

    def get_nonce(self, address: str) -> int:
        """Get next nonce for address"""
        data = self._make_request('GET', f'polygon/nonce/{address}')
        return int(data['nonce'])

    def broadcast_signed_transaction(self, signed_tx: str) -> str:
        """Broadcast signed transaction using Tatum"""
        data = self._make_request('POST', 'polygon/broadcast', 
                                json={'txData': signed_tx})
        return data['txId']

    def get_transaction_receipt(self, tx_hash: str) -> Optional[dict]:
        """Get transaction receipt"""
        try:
            data = self._make_request('GET', f'polygon/transaction/{tx_hash}')
            return data
        except requests.exceptions.HTTPError as e:
            if e.response.status_code == 404:
                return None
            raise

    def estimate_gas(self, from_address: str, to_address: str, data: str) -> int:
        """Estimate gas for transaction"""
        response = self._make_request('POST', 'polygon/gas/estimate',
                                    json={
                                        'from': from_address,
                                        'to': to_address,
                                        'data': data
                                    })
        return int(response['gasLimit'])

    async def subscribe_to_events(self, event_types: list[str], callback: Callable):
        """Subscribe to WebSocket events"""
        if not self.websocket:
            self.websocket = await websockets.connect(
                f"{self.ws_url}?apiKey={self.api_key}"
            )
        
        for event_type in event_types:
            if event_type not in self.subscribers:
                self.subscribers[event_type] = []
            self.subscribers[event_type].append(callback)
            
            await self.websocket.send(json.dumps({
                "type": "SUBSCRIBE",
                "event": event_type
            }))

    async def start_websocket_listener(self):
        """Start WebSocket listener"""
        while True:
            try:
                if not self.websocket:
                    self.websocket = await websockets.connect(
                        f"{self.ws_url}?apiKey={self.api_key}"
                    )

                async for message in self.websocket:
                    data = json.loads(message)
                    event_type = data.get('type')
                    
                    if event_type in self.subscribers:
                        for callback in self.subscribers[event_type]:
                            await callback(data)

            except websockets.exceptions.ConnectionClosed:
                self.websocket = None
                await asyncio.sleep(5)  # Wait before reconnecting
            except Exception as e:
                print(f"WebSocket error: {e}")
                await asyncio.sleep(5)

    def monitor_address(self, address: str, webhook_url: str):
        """Set up address monitoring"""
        self._make_request('POST', 'subscription',
                          json={
                              'type': 'ADDRESS_MONITORING',
                              'attr': {
                                  'address': address,
                                  'chain': 'MATIC',
                                  'url': webhook_url
                              }
                          })

    def get_token_balance(self, address: str, token_address: str) -> int:
        """Get token balance for address"""
        data = self._make_request('GET', 
                                f'polygon/account/balance/{token_address}/{address}')
        return int(data['balance'])

    def get_historical_transactions(self, address: str, 
                                  page_size: int = 50, 
                                  offset: int = 0) -> list:
        """Get historical transactions for address"""
        return self._make_request('GET',
                                f'polygon/account/transaction/{address}',
                                params={'pageSize': page_size, 'offset': offset})

    def get_block_by_hash(self, block_hash: str) -> dict:
        """Get block information by hash"""
        return self._make_request('GET', f'polygon/block/{block_hash}') 