
import { Stock } from '@/types';
import { toast } from '@/hooks/use-toast';
import { getStocks, updateStock } from './crudService';
import { fetchBatchStockPrices } from './stockBatchPriceService';
import { availableProviders } from '../api/stockApiProviders';

// Keeps track of notification states to avoid spamming the user
const notificationState = {
  apiLimitReached: false,
  lastErrorNotification: 0, // timestamp
  errorNotificationCooldown: 300000, // 5 minutes in milliseconds
  providersExhausted: false
};

// Improved notification handling function
const notifyPriceFetchIssue = (failedSymbols: string[], allSymbols: string[]) => {
  const now = Date.now();
  const cooldownPassed = now - notificationState.lastErrorNotification > notificationState.errorNotificationCooldown;
  
  // If all symbols failed and we haven't shown the notification recently
  if (failedSymbols.length === allSymbols.length && cooldownPassed) {
    // Reset notification state
    notificationState.lastErrorNotification = now;
    
    if (notificationState.providersExhausted) {
      toast({
        title: "Stock Data Unavailable",
        description: `Unable to fetch latest prices after trying all providers. Please try again later.`,
        variant: "destructive",
      });
    } else {
      toast({
        title: "API Limit Reached",
        description: `Could not fetch latest stock prices. Trying alternative sources.`,
        variant: "destructive",
      });
      
      // Mark that we're now using alternate providers
      notificationState.apiLimitReached = true;
    }
    return;
  }
  
  // If some symbols failed but not all, and we're allowed to show notifications
  if (failedSymbols.length > 0 && failedSymbols.length < allSymbols.length && cooldownPassed) {
    notificationState.lastErrorNotification = now;
    
    const failedCount = failedSymbols.length;
    const totalCount = allSymbols.length;
    const successPercent = Math.round((totalCount - failedCount) / totalCount * 100);      toast({
      title: "Partial Price Update",
      description: `Updated ${successPercent}% of stocks. Some prices could not be fetched.`,
      variant: "destructive",
    });
  }
  
  // If we previously had failures but now everything succeeded
  if (failedSymbols.length === 0 && notificationState.apiLimitReached && cooldownPassed) {
    notificationState.lastErrorNotification = now;
    notificationState.apiLimitReached = false;
    
    toast({
      title: "Stock Prices Updated",
      description: `Successfully fetched all stock prices.`,
      variant: "default",
    });
  }
};

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
      
      // Handle failed price fetches 
      const failedSymbols = symbols.filter(symbol => batchPrices[symbol] === null);
      
      // Notify the user about any issues
      notifyPriceFetchIssue(failedSymbols, symbols);
      
      // Exit early if all prices failed to fetch
      if (failedSymbols.length === symbols.length) {
        console.error("Failed to fetch any stock prices");
        notificationState.providersExhausted = true;
        return;
      } else {
        // We got at least some prices, so reset this flag
        notificationState.providersExhausted = false;
      }
      
      // Process each stock with its new price
      for (const stock of stocks) {
        const newPrice = batchPrices[stock.symbol];
        
        // Skip if we couldn't get a price for this stock
        if (newPrice === null || newPrice === undefined) {
          console.warn(`No price data available for ${stock.symbol}, keeping current price`);
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
      toast({
        title: "Stock Update Failed",
        description: "Could not update stock prices due to an internal error. Please try again later.",
        variant: "destructive",
      });
    }
  };

  // Initial update
  await updateStockPrices();
  
  // Set up periodic updates (every 5 minutes)
  // Free tier APIs have rate limits, so we use a longer interval
  const intervalId = setInterval(updateStockPrices, 300000);
  
  // Return a function to stop monitoring - this is important for cleanup
  return () => {
    if (intervalId) {
      clearInterval(intervalId);
      console.log("Stock price monitoring stopped");
    }
  };
};
