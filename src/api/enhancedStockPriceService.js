/**
 * Enhanced Stock Price Service with caching, fallback strategies, and robust error handling
 */

import { availableProviders } from './stockApiProviders.js';

class EnhancedStockPriceService {
  constructor() {
    this.cache = new Map();
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes cache
    this.failedProviders = new Set();
    this.providerRetryTimes = new Map();
    this.requestQueue = [];
    this.isProcessingQueue = false;
  }

  /**
   * Get stock prices with intelligent caching and fallback
   */
  async getStockPrices(symbols, options = {}) {
    const {
      useCache = true,
      maxRetries = 3,
      timeout = 30000,
      forceRefresh = false
    } = options;

    console.log(`[EnhancedStockPriceService] Fetching prices for ${symbols.length} symbols`);

    // Check cache first (unless force refresh)
    if (useCache && !forceRefresh) {
      const cachedResults = this.getCachedPrices(symbols);
      const uncachedSymbols = symbols.filter(symbol => !cachedResults.has(symbol));
      
      if (uncachedSymbols.length === 0) {
        console.log('[EnhancedStockPriceService] All prices found in cache');
        return this.mapToResult(symbols, cachedResults);
      }
      
      if (uncachedSymbols.length < symbols.length) {
        console.log(`[EnhancedStockPriceService] ${symbols.length - uncachedSymbols.length} prices found in cache, fetching ${uncachedSymbols.length} fresh`);
      }
      
      // Fetch only uncached symbols
      const freshResults = await this.fetchWithFallback(uncachedSymbols, maxRetries, timeout);
      
      // Combine cached and fresh results
      const combinedResults = new Map([...cachedResults, ...freshResults]);
      return this.mapToResult(symbols, combinedResults);
    }

    // Fetch all symbols fresh
    const results = await this.fetchWithFallback(symbols, maxRetries, timeout);
    return this.mapToResult(symbols, results);
  }

  /**
   * Get cached prices for symbols
   */
  getCachedPrices(symbols) {
    const results = new Map();
    const now = Date.now();

    for (const symbol of symbols) {
      const cached = this.cache.get(symbol);
      if (cached && (now - cached.timestamp) < this.cacheExpiry) {
        results.set(symbol, cached.price);
      }
    }

    return results;
  }

  /**
   * Fetch prices with provider fallback strategy
   */
  async fetchWithFallback(symbols, maxRetries, timeout) {
    const results = new Map();
    let remainingSymbols = [...symbols];
    let attempt = 0;

    while (remainingSymbols.length > 0 && attempt < maxRetries) {
      attempt++;
      console.log(`[EnhancedStockPriceService] Attempt ${attempt}/${maxRetries} for ${remainingSymbols.length} symbols`);

      // Get available providers (excluding failed ones that are still in retry timeout)
      const availableProvs = this.getAvailableProviders();
      
      if (availableProvs.length === 0) {
        console.error('[EnhancedStockPriceService] No providers available');
        break;
      }

      // Group symbols by optimal provider
      const providerGroups = this.groupSymbolsByProvider(remainingSymbols, availableProvs);

      // Process each provider group
      for (const [provider, symbolGroup] of providerGroups) {
        if (symbolGroup.length === 0) continue;

        try {
          console.log(`[EnhancedStockPriceService] Fetching ${symbolGroup.length} symbols from ${provider.name}`);
          
          const providerResults = await Promise.race([
            provider.fetchPrices(symbolGroup),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Timeout')), timeout)
            )
          ]);

          // Process successful results
          for (const [symbol, price] of Object.entries(providerResults)) {
            if (price !== null && price !== undefined && !isNaN(price)) {
              results.set(symbol, price);
              this.cachePrice(symbol, price);
              
              // Remove from remaining symbols
              remainingSymbols = remainingSymbols.filter(s => s !== symbol);
            }
          }

          console.log(`[EnhancedStockPriceService] ${provider.name} returned ${Object.keys(providerResults).length} results`);

        } catch (error) {
          console.error(`[EnhancedStockPriceService] Provider ${provider.name} failed:`, error.message);
          
          // Mark provider as failed temporarily
          this.markProviderFailed(provider.name);
          
          // If this was a rate limit error, extend the retry time
          if (error.message.includes('429') || error.message.includes('rate limit')) {
            this.extendProviderRetryTime(provider.name, 10 * 60 * 1000); // 10 minutes
          }
        }

        // Add delay between providers to avoid overwhelming APIs
        if (providerGroups.size > 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      // If we still have remaining symbols, wait before next attempt
      if (remainingSymbols.length > 0 && attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
        console.log(`[EnhancedStockPriceService] Waiting ${delay}ms before retry for ${remainingSymbols.length} symbols`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    // Log final results
    console.log(`[EnhancedStockPriceService] Final result: ${results.size}/${symbols.length} prices fetched`);
    
    return results;
  }

  /**
   * Get providers that are currently available (not in retry timeout)
   */
  getAvailableProviders() {
    const now = Date.now();
    return availableProviders.filter(provider => {
      const retryTime = this.providerRetryTimes.get(provider.name);
      return !retryTime || now > retryTime;
    });
  }

  /**
   * Group symbols by the most appropriate provider
   */
  groupSymbolsByProvider(symbols, providers) {
    const groups = new Map();
    
    // Initialize groups
    providers.forEach(provider => {
      groups.set(provider, []);
    });

    // Assign symbols to providers based on regional optimization
    symbols.forEach(symbol => {
      const optimalProvider = this.selectOptimalProvider(symbol, providers);
      if (optimalProvider) {
        groups.get(optimalProvider).push(symbol);
      }
    });

    return groups;
  }

  /**
   * Select the optimal provider for a symbol
   */
  selectOptimalProvider(symbol, providers) {
    // Determine symbol region
    const isIndian = this.isIndianStock(symbol);
    const isUS = this.isUSStock(symbol);

    if (isIndian) {
      // For Indian stocks, prefer Yahoo Finance
      return providers.find(p => p.name === 'Yahoo Finance') || 
             providers.find(p => p.name === 'Alpha Vantage') ||
             providers[0];
    } else if (isUS) {
      // For US stocks, prefer FMP
      return providers.find(p => p.name === 'Financial Modeling Prep') ||
             providers.find(p => p.name === 'Alpha Vantage') ||
             providers[0];
    } else {
      // For other stocks, use the first available provider
      return providers[0];
    }
  }

  /**
   * Check if stock is Indian
   */
  isIndianStock(symbol) {
    if (symbol.endsWith('.NS') || symbol.endsWith('.BO')) {
      return true;
    }
    
    const indianSymbols = [
      'HDFCBANK', 'LT', 'TCS', 'RELIANCE', 'INFY', 'WIPRO', 'BHARTIARTL',
      'SBIN', 'ICICIBANK', 'KOTAKBANK', 'ITC', 'HINDUNILVR', 'NESTLEIND',
      'ASIANPAINT', 'MARUTI', 'BAJFINANCE', 'HCLTECH', 'TECHM', 'ULTRACEMCO',
      'TITAN', 'SUNPHARMA', 'DRREDDY', 'COALINDIA', 'NTPC', 'POWERGRID',
      'ONGC', 'GRASIM', 'JSWSTEEL', 'TATASTEEL', 'HINDALCO'
    ];
    
    return indianSymbols.includes(symbol);
  }

  /**
   * Check if stock is US
   */
  isUSStock(symbol) {
    return symbol.length <= 5 && !symbol.includes('.') && !this.isIndianStock(symbol);
  }

  /**
   * Cache a price with timestamp
   */
  cachePrice(symbol, price) {
    this.cache.set(symbol, {
      price,
      timestamp: Date.now()
    });
  }

  /**
   * Mark a provider as temporarily failed
   */
  markProviderFailed(providerName, retryDelay = 5 * 60 * 1000) { // 5 minutes default
    this.failedProviders.add(providerName);
    this.providerRetryTimes.set(providerName, Date.now() + retryDelay);
    
    console.log(`[EnhancedStockPriceService] Provider ${providerName} marked as failed, retry in ${retryDelay / 1000} seconds`);
  }

  /**
   * Extend provider retry time (for rate limiting)
   */
  extendProviderRetryTime(providerName, additionalDelay) {
    const currentRetryTime = this.providerRetryTimes.get(providerName) || Date.now();
    this.providerRetryTimes.set(providerName, currentRetryTime + additionalDelay);
    
    console.log(`[EnhancedStockPriceService] Provider ${providerName} retry time extended by ${additionalDelay / 1000} seconds`);
  }

  /**
   * Map results to the expected format
   */
  mapToResult(requestedSymbols, resultMap) {
    const result = {};
    requestedSymbols.forEach(symbol => {
      result[symbol] = resultMap.get(symbol) || null;
    });
    return result;
  }

  /**
   * Clear cache (useful for testing or forced refresh)
   */
  clearCache() {
    this.cache.clear();
    console.log('[EnhancedStockPriceService] Cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    const now = Date.now();
    let validEntries = 0;
    let expiredEntries = 0;

    for (const [symbol, cached] of this.cache.entries()) {
      if ((now - cached.timestamp) < this.cacheExpiry) {
        validEntries++;
      } else {
        expiredEntries++;
      }
    }

    return {
      totalEntries: this.cache.size,
      validEntries,
      expiredEntries,
      failedProviders: Array.from(this.failedProviders),
      providersInRetry: Array.from(this.providerRetryTimes.keys())
    };
  }

  /**
   * Health check for the service
   */
  async healthCheck() {
    const testSymbols = ['AAPL', 'HDFCBANK']; // One US, one Indian
    
    try {
      const startTime = Date.now();
      const results = await this.getStockPrices(testSymbols, { 
        useCache: false, 
        maxRetries: 1,
        timeout: 10000 
      });
      const responseTime = Date.now() - startTime;

      const successful = Object.values(results).filter(price => price !== null).length;
      
      return {
        healthy: successful > 0,
        responseTime,
        successRate: successful / testSymbols.length,
        availableProviders: this.getAvailableProviders().length,
        cacheStats: this.getCacheStats()
      };
    } catch (error) {
      return {
        healthy: false,
        error: error.message,
        availableProviders: this.getAvailableProviders().length,
        cacheStats: this.getCacheStats()
      };
    }
  }
}

// Create singleton instance
const enhancedPriceService = new EnhancedStockPriceService();

export default enhancedPriceService;
export { EnhancedStockPriceService };
