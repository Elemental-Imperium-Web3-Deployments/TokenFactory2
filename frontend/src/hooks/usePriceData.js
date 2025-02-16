import { useState, useEffect, useCallback } from 'react';
import { PriceFeedService } from '../services/priceFeed';

export const usePriceData = (provider, aggregatorAddress) => {
  const [priceHistory, setPriceHistory] = useState([]);
  const [currentPrice, setCurrentPrice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const priceFeed = new PriceFeedService(provider, aggregatorAddress);

  const refreshPrice = useCallback(async () => {
    try {
      const price = await priceFeed.getLatestPrice();
      setCurrentPrice(price);
      return price;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [priceFeed]);

  useEffect(() => {
    const loadPriceData = async () => {
      try {
        setLoading(true);
        const [price, history] = await Promise.all([
          priceFeed.getLatestPrice(),
          priceFeed.getPriceHistory()
        ]);
        
        setCurrentPrice(price);
        setPriceHistory(history);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadPriceData();
  }, [priceFeed]);

  return {
    priceHistory,
    currentPrice,
    loading,
    error,
    refreshPrice
  };
}; 