
import { StockHolding } from '@/types';
import { toast } from '@/hooks/use-toast';
import { getStocks, updateStock } from './crudService';

// The Alpha Vantage API key (free tier)
const ALPHA_VANTAGE_API_KEY = 'demo'; // Replace with your API key for production use

// Fetch real stock data from Alpha Vantage API
const fetchStockPrice = async (symbol: string): Promise<number | null> => {
  try {
    // Using the Global Quote endpoint to get latest price
    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`Error fetching stock price for ${symbol}: ${response.statusText}`);
      return null;
    }
    
    const data = await response.json();
    
    // Alpha Vantage returns price in the "Global Quote" object
    if (data['Global Quote'] && data['Global Quote']['05. price']) {
      const price = parseFloat(data['Global Quote']['05. price']);
      return price;
    } else {
      console.error(`No price data found for ${symbol}`, data);
      return null;
    }
  } catch (error) {
    console.error(`Failed to fetch price for ${symbol}:`, error);
    return null;
  }
};

// Start monitoring real-time stock prices
export const startStockPriceMonitoring = async (alertThreshold: number) => {
  const updateStockPrices = async () => {
    try {
      const stocks = await getStocks();
      
      for (const stock of stocks) {
        // Get the real price from the API
        const newPrice = await fetchStockPrice(stock.symbol);
        
        // If we couldn't get a real price, skip this stock
        if (newPrice === null) {
          console.warn(`Skipping price update for ${stock.symbol} - could not fetch current price`);
          continue;
        }
        
        const previousPrice = stock.currentPrice;
        
        // Calculate the price change as a percentage
        const changePercent = ((newPrice - previousPrice) / previousPrice) * 100;
        const absoluteChange = Math.abs(changePercent);
        
        // Check if the change exceeds the alert threshold
        if (absoluteChange >= alertThreshold) {
          // Alert the user about the significant price change
          const direction = changePercent >= 0 ? 'increased' : 'decreased';
          toast({
            title: `${stock.symbol} Alert`,
            description: `${stock.name} has ${direction} by ${absoluteChange.toFixed(2)}% (₹${previousPrice.toFixed(2)} → ₹${newPrice.toFixed(2)})`,
            variant: changePercent >= 0 ? 'default' : 'destructive',
          });
        }
        
        // Update the stock with the new price
        await updateStock(stock.id, {
          currentPrice: newPrice,
          change: newPrice - previousPrice,
          changePercent,
          value: newPrice * stock.quantity,
          lastUpdated: new Date()
        });
      }
    } catch (error) {
      console.error("Error updating stock prices:", error);
    }
  };

  // Initial update
  await updateStockPrices();
  
  // Set up periodic updates (every 60 seconds)
  // Alpha Vantage free tier has rate limits, so we don't want to call too frequently
  const intervalId = setInterval(updateStockPrices, 60000);
  
  // Return a function to stop monitoring - this is important for cleanup
  return () => {
    if (intervalId) {
      clearInterval(intervalId);
      console.log("Stock price monitoring stopped");
    }
  };
};

// Fallback to simulation if the API doesn't work or rate limits are exceeded
export const simulateStockPriceUpdates = async (alertThreshold: number) => {
  const updateStockPrices = async () => {
    try {
      const stocks = await getStocks();
      
      for (const stock of stocks) {
        // Simulate a random price change (-3% to +3%)
        const changePercent = (Math.random() * 6 - 3);
        const previousPrice = stock.currentPrice;
        const newPrice = previousPrice * (1 + (changePercent / 100));
        
        // Calculate the price change as a percentage
        const absoluteChange = Math.abs(changePercent);
        
        // Check if the change exceeds the alert threshold
        if (absoluteChange >= alertThreshold) {
          // Alert the user about the significant price change
          const direction = changePercent >= 0 ? 'increased' : 'decreased';
          toast({
            title: `${stock.symbol} Alert`,
            description: `${stock.name} has ${direction} by ${absoluteChange.toFixed(2)}% (₹${previousPrice.toFixed(2)} → ₹${newPrice.toFixed(2)})`,
            variant: changePercent >= 0 ? 'default' : 'destructive',
          });
        }
        
        // Update the stock with the new price
        await updateStock(stock.id, {
          currentPrice: newPrice,
          change: newPrice - previousPrice,
          changePercent,
          value: newPrice * stock.quantity,
          lastUpdated: new Date()
        });
      }
    } catch (error) {
      console.error("Error updating stock prices:", error);
    }
  };

  // Initial update
  await updateStockPrices();
  
  // Set up periodic updates (every 30 seconds in this example)
  const intervalId = setInterval(updateStockPrices, 30000);
  
  // Return a function to stop monitoring - this is important for cleanup
  return () => {
    if (intervalId) {
      clearInterval(intervalId);
      console.log("Stock price monitoring stopped");
    }
  };
};
