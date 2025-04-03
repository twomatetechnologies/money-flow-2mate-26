
import { StockHolding } from '@/types';
import { toast } from '@/hooks/use-toast';
import { getStocks, updateStock } from './crudService';

// Simulate a real-time stock price update service
export const startStockPriceMonitoring = async (alertThreshold: number) => {
  // This function simulates periodic stock price updates
  // In a real application, this would connect to a real-time market data API
  
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
  // In a real application, you might use a WebSocket or a market data API's own update mechanism
  const intervalId = setInterval(updateStockPrices, 30000);
  
  // Return a function to stop monitoring
  return () => clearInterval(intervalId);
};
