/**
 * API endpoint for refreshing stock prices
 */
import { getStocks, updateStock } from '../crudService.js';
import { fetchBatchStockPrices } from '../stockBatchPriceService.js';
import { availableProviders } from '../stockApiProviders.js';

// Handler for refreshing stock prices
const refreshStockPrices = async (req, res) => {
  console.log('[Stock Price Refresh] Request received, method:', req.method);
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { symbols } = req.body;

    console.log('[Stock Price Refresh] Symbols received:', symbols);

    if (!symbols || !Array.isArray(symbols) || symbols.length === 0) {
      console.log('[Stock Price Refresh] Invalid symbols array:', symbols);
      return res.status(400).json({ error: 'Valid stock symbols array is required' });
    }

    // Fetch all stocks to get their IDs
    console.log('[Stock Price Refresh] Fetching all stocks');
    const allStocks = await getStocks();
    console.log('[Stock Price Refresh] Stocks fetched:', allStocks.length);
    
    // Create a map of symbol to stock ID for quick lookup
    const stockMap = {};
    for (const stock of allStocks) {
      stockMap[stock.symbol] = stock.id;
      console.log(`[Stock Price Refresh] Mapping ${stock.symbol} to ID ${stock.id}`);
    }

    // Fetch the latest prices for the requested symbols
    console.log('[Stock Price Refresh] Fetching batch prices for symbols:', symbols);
    const batchPrices = await fetchBatchStockPrices(symbols);
    console.log('[Stock Price Refresh] Batch prices received:', batchPrices);
    
    // Count successful updates and track failures
    let updatedCount = 0;
    const failedSymbols = [];
    
    // Update each stock with its new price
    for (const symbol of symbols) {
      const newPrice = batchPrices[symbol];
      const stockId = stockMap[symbol];
      
      console.log(`[Stock Price Refresh] Processing ${symbol}: price=${newPrice}, stockId=${stockId}`);
      
      // Track failed symbols
      if (newPrice === null || newPrice === undefined) {
        console.log(`[Stock Price Refresh] No price found for ${symbol}`);
        failedSymbols.push(symbol);
        continue;
      }
      
      if (!stockId) {
        console.log(`[Stock Price Refresh] No stock ID found for ${symbol}`);
        failedSymbols.push(symbol);
        continue;
      }
      
      // Get the original stock to calculate change
      const originalStock = allStocks.find(s => s.symbol === symbol);
      if (!originalStock) {
        console.log(`[Stock Price Refresh] No original stock found for ${symbol}`);
        failedSymbols.push(symbol);
        continue;
      }
      
      // Use current_price if available, otherwise use purchase_price
      const previousPrice = originalStock.current_price || originalStock.purchase_price;
      
      console.log(`[Stock Price Refresh] Updating ${symbol}: old price=${previousPrice}, new price=${newPrice}`);
      
      try {
        // Update the stock with the new price - only update current_price and last_updated
        // The value column is a computed column in the database (quantity * current_price)
        const updateResult = await updateStock(stockId, {
          current_price: newPrice,
          last_updated: new Date()
        });
        
        console.log(`[Stock Price Refresh] Update result for ${symbol}:`, updateResult);
        updatedCount++;
      } catch (updateError) {
        console.error(`[Stock Price Refresh] Error updating ${symbol}:`, updateError);
        failedSymbols.push(symbol);
      }
    }
    
    // Determine the response status and message based on success rate
    const failureCount = failedSymbols.length;
    let status = 200;
    let message = `Updated ${updatedCount} of ${symbols.length} stock prices`;
    
    // If all updates failed, return an error
    if (updatedCount === 0 && symbols.length > 0) {
      status = 503; // Service Unavailable
      message = 'All stock price updates failed. API services may be unavailable.';
    } 
    // If some updates failed, return a partial success
    else if (failureCount > 0) {
      status = 207; // Multi-Status
      message = `Updated ${updatedCount} of ${symbols.length} stock prices. Some symbols could not be updated.`;
    }
    
    // Include information about the providers used
    const providersInfo = availableProviders.map(p => ({
      name: p.name,
      hasApiKey: !!p.apiKey || !!process.env[p.apiKeyEnvVar]
    }));
    
    console.log(`[Stock Price Refresh] Completed: ${message}`);
    
    res.status(status).json({ 
      success: updatedCount > 0,
      message,
      updated: updatedCount,
      total: symbols.length,
      prices: batchPrices,
      failedSymbols: failedSymbols.length > 0 ? failedSymbols : undefined,
      providers: providersInfo
    });
  } catch (error) {
    console.error('[Stock Price Refresh] Error:', error);
    res.status(500).json({ 
      error: 'Server error while refreshing stock prices',
      message: error.message,
      success: false
    });
  }
};

export default refreshStockPrices;
