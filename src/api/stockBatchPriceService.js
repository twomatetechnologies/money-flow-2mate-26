/**
 * JavaScript version of stockBatchPriceService
 * Serves as a bridge between JS and TS modules for the API
 */

import { availableProviders } from './stockApiProviders.js';
import enhancedPriceService from './enhancedStockPriceService.js';
import stockPriceMonitor from './stockPriceMonitor.js';

// Track API provider failure counts to know when to switch providers
const providerFailureCounts = {};
// Track current provider index
let currentProviderIndex = 0;

/**
 * Map database stock symbols to API provider symbols
 * @param {string} symbol The stock symbol from the database
 * @returns {string} The symbol formatted for API providers
 */
const mapSymbolForAPI = (symbol) => {
  // Indian stock symbols mapping
  const indianStocks = {
    'HDFCBANK': 'HDFCBANK.NS',
    'LT': 'LT.NS',
    'TCS': 'TCS.NS',
    'RELIANCE': 'RELIANCE.NS',
    'INFY': 'INFY.NS',
    'WIPRO': 'WIPRO.NS',
    'BHARTIARTL': 'BHARTIARTL.NS',
    'SBIN': 'SBIN.NS',
    'ICICIBANK': 'ICICIBANK.NS',
    'KOTAKBANK': 'KOTAKBANK.NS',
    'ITC': 'ITC.NS',
    'HINDUNILVR': 'HINDUNILVR.NS',
    'NESTLEIND': 'NESTLEIND.NS',
    'ASIANPAINT': 'ASIANPAINT.NS',
    'MARUTI': 'MARUTI.NS',
    'BAJFINANCE': 'BAJFINANCE.NS',
    'HCLTECH': 'HCLTECH.NS',
    'TECHM': 'TECHM.NS',
    'ULTRACEMCO': 'ULTRACEMCO.NS',
    'TITAN': 'TITAN.NS',
    'SUNPHARMA': 'SUNPHARMA.NS',
    'DRREDDY': 'DRREDDY.NS',
    'COALINDIA': 'COALINDIA.NS',
    'NTPC': 'NTPC.NS',
    'POWERGRID': 'POWERGRID.NS',
    'ONGC': 'ONGC.NS',
    'GRASIM': 'GRASIM.NS',
    'JSWSTEEL': 'JSWSTEEL.NS',
    'TATASTEEL': 'TATASTEEL.NS',
    'HINDALCO': 'HINDALCO.NS',
    'ADANIPORTS': 'ADANIPORTS.NS',
    'BPCL': 'BPCL.NS',
    'IOC': 'IOC.NS',
    'HEROMOTOCO': 'HEROMOTOCO.NS',
    'BAJAJ-AUTO': 'BAJAJ-AUTO.NS',
    'M&M': 'M&M.NS',
    'EICHERMOT': 'EICHERMOT.NS',
    'TATACONSUM': 'TATACONSUM.NS',
    'BRITANNIA': 'BRITANNIA.NS',
    'DIVISLAB': 'DIVISLAB.NS',
    'CIPLA': 'CIPLA.NS',
    'APOLLOHOSP': 'APOLLOHOSP.NS',
    'INDIGO': 'INDIGO.NS',
    'SPICEJET': 'SPICEJET.NS',
    'JUBLFOOD': 'JUBLFOOD.NS',
    'PEL': 'PEL.NS',
    'WHIRLPOOL': 'WHIRLPOOL.NS',
    'GODREJCP': 'GODREJCP.NS',
    'PIDILITIND': 'PIDILITIND.NS',
    'BERGEPAINT': 'BERGEPAINT.NS',
    'AKZONOBEL': 'AKZONOBEL.NS',
    'INDIGOPNTS': 'INDIGOPNTS.NS',
    'HINDCOPPER': 'HINDCOPPER.NS',
    'HAL': 'HAL.NS',
    'IEX': 'IEX.NS',
    'BSEL': 'BSEL.NS'
  };
  
  // Check if it's an Indian stock
  if (indianStocks[symbol]) {
    console.log(`Mapping Indian stock symbol: ${symbol} -> ${indianStocks[symbol]}`);
    return indianStocks[symbol];
  }
  
  // For US stocks and others, return as-is
  return symbol;
};

/**
 * Map API provider symbols back to database symbols
 * @param {string} apiSymbol The symbol returned from API providers
 * @returns {string} The symbol as stored in the database
 */
const mapSymbolFromAPI = (apiSymbol) => {
  // Remove .NS, .BO suffixes for Indian stocks
  if (apiSymbol.endsWith('.NS') || apiSymbol.endsWith('.BO')) {
    return apiSymbol.replace(/\.(NS|BO)$/, '');
  }
  
  // For other stocks, return as-is
  return apiSymbol;
};

/**
 * Validate stock price data to ensure it's reasonable
 * @param {string} symbol The stock symbol
 * @param {number|null} price The price to validate
 * @returns {boolean} true if the price is valid, false otherwise
 */
const validateStockPrice = (symbol, price) => {
  if (price === null || price === undefined) return false;
  
  // Basic validation: price must be positive and reasonable
  if (price <= 0 || price > 1000000) {
    console.warn(`Invalid price for ${symbol}: ${price} - outside reasonable range`);
    return false;
  }
  
  return true;
};

/**
 * Selects the best available stock API provider based on previous successes/failures
 * @returns The selected provider
 */
const selectProvider = () => {
  // Reset provider if we've gone through them all
  if (currentProviderIndex >= availableProviders.length) {
    currentProviderIndex = 0;
    // Also reset failure counts when we cycle back
    for (const key in providerFailureCounts) {
      providerFailureCounts[key] = 0;
    }
  }
  
  return availableProviders[currentProviderIndex];
};

/**
 * Process symbols in batches according to the provider's batch size constraints
 */
const processBatches = async (symbols, provider) => {
  const result = {};
  const { batchSize, batchDelay, name } = provider;
  
  try {
    // Partition symbols into batches
    for (let i = 0; i < symbols.length; i += batchSize) {
      console.log(`[${name}] Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(symbols.length/batchSize)}`);
      
      const batch = symbols.slice(i, i + batchSize);
      
      // Map database symbols to API symbols
      const mappedBatch = batch.map(symbol => mapSymbolForAPI(symbol));
      console.log(`[${name}] Original batch:`, batch);
      console.log(`[${name}] Mapped batch:`, mappedBatch);
      
      // Fetch this batch of symbols using mapped symbols
      const batchResult = await provider.fetchPrices(mappedBatch);
      console.log(`[${name}] Batch result:`, batchResult);
      
      // Validate each price and merge into result using original symbols
      for (let j = 0; j < batch.length; j++) {
        const originalSymbol = batch[j];
        const mappedSymbol = mappedBatch[j];
        const price = batchResult[mappedSymbol];
        
        console.log(`[${name}] Processing ${originalSymbol} (${mappedSymbol}): price=${price}`);
        
        if (validateStockPrice(originalSymbol, price)) {
          result[originalSymbol] = price;
        } else {
          result[originalSymbol] = null;
        }
      }
      
      // Check if we failed to get prices for this batch
      const failedSymbols = batch.filter(symbol => result[symbol] === null);
      if (failedSymbols.length === batch.length) {
        // All symbols failed, increment failure count for this provider
        providerFailureCounts[name] = (providerFailureCounts[name] || 0) + 1;
        
        // If we've had multiple failures with this provider, try switching to the next one
        if (providerFailureCounts[name] >= 2) {
          console.log(`[${name}] Multiple failures detected, switching providers`);
          currentProviderIndex++;
          // Don't continue with this failing provider
          break;
        }
      }
      
      // Add a delay between batches to respect API rate limits
      if (i + batchSize < symbols.length) {
        console.log(`[${name}] Waiting ${batchDelay/1000} seconds before processing next batch...`);
        await new Promise(resolve => setTimeout(resolve, batchDelay));
      }
    }
    
    return result;
  } catch (error) {
    console.error(`[${name}] Error processing batches:`, error);
    
    // Mark this provider as failed
    providerFailureCounts[name] = (providerFailureCounts[name] || 0) + 1;
    currentProviderIndex++;
    
    // Return empty result
    return symbols.reduce((acc, symbol) => {
      acc[symbol] = null;
      return acc;
    }, {});
  }
};

/**
 * Batch fetch stock prices using multiple API providers with fallback mechanism
 * This function groups stock symbols and fetches them in batches to reduce API calls
 * If one provider fails, it will try the next available provider
 * 
 * @param {string[]} symbols Array of stock symbols to fetch prices for
 * @returns {Object} Object with stock symbols as keys and prices as values
 */
export const fetchBatchStockPrices = async (symbols) => {
  console.log('[stockBatchPriceService] Starting fetchBatchStockPrices with symbols:', symbols);
  if (!symbols.length) return {};

  const result = {};
  const startedProviderIndex = currentProviderIndex;
  const failedSymbols = [];
  
  // Try each provider until we get results or run out of providers
  do {
    const provider = selectProvider();
    console.log(`[stockBatchPriceService] Using stock data provider: ${provider.name}`);
    console.log(`[stockBatchPriceService] Provider API key: ${provider.apiKey ? '***' + provider.apiKey.slice(-4) : 'none required'}`);
    
    // Process all symbols with the current provider
    const providerResults = await processBatches(symbols, provider);
    
    // Merge results, only keeping non-null values
    for (const symbol of symbols) {
      // If we already have a value for this symbol from a previous provider, skip it
      if (result[symbol] !== undefined && result[symbol] !== null) continue;
      
      // Get the result from this provider
      const price = providerResults[symbol];
      
      if (price !== null) {
        result[symbol] = price;
      } else {
        // Track failed symbols for retry with next provider
        if (!failedSymbols.includes(symbol)) {
          failedSymbols.push(symbol);
        }
      }
    }
    
    // If we've successfully fetched all symbols, we're done
    const remainingFailedSymbols = symbols.filter(symbol => result[symbol] === null || result[symbol] === undefined);
    if (remainingFailedSymbols.length === 0) {
      break;
    }
    
    // Try the next provider, but only if we have symbols that failed
    if (remainingFailedSymbols.length > 0) {
      // Skip to next provider
      currentProviderIndex++;
      
      // If we've tried all providers, stop trying
      if (currentProviderIndex >= availableProviders.length) {
        break;
      }
    }
    
    // Ensure we don't go into an infinite loop if we've cycled through all providers
    if (currentProviderIndex === startedProviderIndex) {
      console.log("All providers failed, giving up");
      break;
    }
  } while (true);
  
  // Ensure all symbols have at least a null value in the result
  for (const symbol of symbols) {
    if (result[symbol] === undefined) {
      result[symbol] = null;
    }
  }
  
  console.log('[stockBatchPriceService] Final results:', result);
  return result;
};
