
import { StockHolding } from '@/types';
import { toast } from '@/hooks/use-toast';
import { getStocks, updateStock } from './crudService';
import { fetchBatchStockPrices, simulateBatchStockPrices } from './stockBatchPriceService';

// Start monitoring real-time stock prices
export const startStockPriceMonitoring = async (alertThreshold: number) => {
  const updateStockPrices = async () => {
    try {
      const stocks = await getStocks();
      
      if (stocks.length === 0) {
        console.log("No stocks to update");
        return;
      }
      
      // Extract all symbols from stocks
      const symbols = stocks.map(stock => stock.symbol);
      
      // Fetch batch prices
      const batchPrices = await fetchBatchStockPrices(symbols);
      
      // If batch prices didn't work, use simulation as fallback
      const useSimulation = Object.values(batchPrices).every(price => price === null);
      const finalPrices = useSimulation ? simulateBatchStockPrices(stocks) : batchPrices;
      
      if (useSimulation) {
        console.log("Using simulated data for all stocks due to API limitations");
      }
      
      // Process each stock with its new price
      for (const stock of stocks) {
        const newPrice = finalPrices[stock.symbol];
        
        // Skip if we couldn't get a price for this stock
        if (newPrice === null || newPrice === undefined) {
          console.warn(`No price data available for ${stock.symbol}`);
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
  
  // Set up periodic updates (every 5 minutes)
  // Alpha Vantage free tier has rate limits (5 calls per minute), so we use a longer interval
  const intervalId = setInterval(updateStockPrices, 300000);
  
  // Return a function to stop monitoring - this is important for cleanup
  return () => {
    if (intervalId) {
      clearInterval(intervalId);
      console.log("Stock price monitoring stopped");
    }
  };
};

// This function is kept for backward compatibility
export const simulateStockPriceUpdates = async (alertThreshold: number) => {
  return startStockPriceMonitoring(alertThreshold);
};
