import { ethers } from 'ethers';

export class PriceFeedService {
  constructor(provider, aggregatorAddress) {
    this.provider = provider;
    this.aggregatorAddress = aggregatorAddress;
    this.abi = [
      'function latestRoundData() external view returns (uint80, int256, uint256, uint256, uint80)',
      'function decimals() external view returns (uint8)'
    ];
    this.contract = new ethers.Contract(aggregatorAddress, this.abi, provider);
  }

  async getLatestPrice() {
    try {
      const [, price] = await this.contract.latestRoundData();
      const decimals = await this.contract.decimals();
      return ethers.utils.formatUnits(price, decimals);
    } catch (error) {
      console.error('Error fetching price:', error);
      throw error;
    }
  }

  async getPriceHistory(blocks = 24) {
    const history = [];
    const currentBlock = await this.provider.getBlockNumber();
    
    for (let i = 0; i < blocks; i++) {
      const blockNumber = currentBlock - (i * 100);
      const price = await this.getLatestPrice({ blockTag: blockNumber });
      history.unshift({
        block: blockNumber,
        price: parseFloat(price),
        timestamp: Date.now() - (i * 3600 * 1000)
      });
    }
    
    return history;
  }
} 