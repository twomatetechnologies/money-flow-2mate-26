/**
 * Stock Price Update Scheduler
 * Handles scheduled and real-time stock price updates with robust error handling,
 * multiple provider fallbacks, and rate limiting management.
 */

import cron from 'node-cron';
import { availableProviders } from './stockApiProviders.js';
import { fetchBatchStockPrices } from './stockBatchPriceService.js';

class StockPriceScheduler {
  constructor() {
    this.isRunning = false;
    this.lastUpdateTime = null;
    this.failedUpdateCount = 0;
    this.maxFailedUpdates = 5;
    this.updateQueue = new Set();
    this.isUpdating = false;
    this.scheduledJobs = [];
    
    // Rate limiting tracking
    this.providerRateLimits = new Map();
    this.providerLastUsed = new Map();
    
    // Update statistics
    this.stats = {
      totalUpdates: 0,
      successfulUpdates: 0,
      failedUpdates: 0,
      lastSuccessfulUpdate: null,
      averageUpdateTime: 0
    };
  }

  /**
   * Initialize the scheduler with different update frequencies
   */
  start() {
    if (this.isRunning) {
      console.log('[StockPriceScheduler] Already running');
      return;
    }

    console.log('[StockPriceScheduler] Starting scheduler...');
    this.isRunning = true;

    // Daily market open update (9:30 AM IST for Indian markets, 9:30 AM EST for US markets)
    // Run at 4:00 AM UTC (9:30 AM IST) and 2:30 PM UTC (9:30 AM EST)
    const dailyMarketOpenJob = cron.schedule('0 4,14 * * 1-5', async () => {
      console.log('[StockPriceScheduler] Running daily market open price update');
      await this.updateAllStocks('market_open');
    }, {
      scheduled: false,
      timezone: 'UTC'
    });

    // Hourly updates during market hours (lighter load)
    const hourlyUpdateJob = cron.schedule('0 * * * 1-5', async () => {
      const currentHour = new Date().getUTCHours();
      // Run during Indian market hours (4-10 UTC) and US market hours (14-21 UTC)
      if ((currentHour >= 4 && currentHour <= 10) || (currentHour >= 14 && currentHour <= 21)) {
        console.log('[StockPriceScheduler] Running hourly price update');
        await this.updateAllStocks('hourly');
      }
    }, {
      scheduled: false,
      timezone: 'UTC'
    });

    // End of day update (6:00 PM IST for Indian markets, 4:00 PM EST for US markets)
    const endOfDayJob = cron.schedule('30 10,21 * * 1-5', async () => {
      console.log('[StockPriceScheduler] Running end-of-day price update');
      await this.updateAllStocks('end_of_day');
    }, {
      scheduled: false,
      timezone: 'UTC'
    });

    // Weekly comprehensive update (Saturdays at 2:00 AM UTC)
    const weeklyUpdateJob = cron.schedule('0 2 * * 6', async () => {
      console.log('[StockPriceScheduler] Running weekly comprehensive update');
      await this.updateAllStocks('weekly_comprehensive');
    }, {
      scheduled: false,
      timezone: 'UTC'
    });

    // Start all jobs
    dailyMarketOpenJob.start();
    hourlyUpdateJob.start();
    endOfDayJob.start();
    weeklyUpdateJob.start();

    this.scheduledJobs = [dailyMarketOpenJob, hourlyUpdateJob, endOfDayJob, weeklyUpdateJob];

    console.log('[StockPriceScheduler] Scheduler started with multiple update frequencies');
  }

  /**
   * Stop the scheduler
   */
  stop() {
    if (!this.isRunning) {
      console.log('[StockPriceScheduler] Already stopped');
      return;
    }

    console.log('[StockPriceScheduler] Stopping scheduler...');
    
    // Stop all scheduled jobs
    this.scheduledJobs.forEach(job => {
      if (job) {
        job.stop();
      }
    });
    
    this.scheduledJobs = [];
    this.isRunning = false;
    
    console.log('[StockPriceScheduler] Scheduler stopped');
  }

  /**
   * Update all stocks with intelligent provider selection and error handling
   */
  async updateAllStocks(updateType = 'manual') {
    if (this.isUpdating) {
      console.log('[StockPriceScheduler] Update already in progress, skipping');
      return { success: false, reason: 'Update already in progress' };
    }

    this.isUpdating = true;
    const startTime = Date.now();
    let result = { success: false, updated: 0, failed: 0, errors: [] };

    try {
      console.log(`[StockPriceScheduler] Starting ${updateType} update for all stocks`);
      
      // Get all unique stock symbols from the database
      const allStocks = await this.getAllUniqueStocks();
      
      if (!allStocks || allStocks.length === 0) {
        console.log('[StockPriceScheduler] No stocks found to update');
        return { success: true, updated: 0, failed: 0, message: 'No stocks to update' };
      }

      console.log(`[StockPriceScheduler] Found ${allStocks.length} unique stocks to update`);

      // Group stocks by region for optimized provider selection
      const stockGroups = this.groupStocksByRegion(allStocks);
      
      // Update each group with the most appropriate provider
      for (const [region, stocks] of Object.entries(stockGroups)) {
        if (stocks.length === 0) continue;
        
        console.log(`[StockPriceScheduler] Updating ${stocks.length} ${region} stocks`);
        
        const groupResult = await this.updateStockGroup(stocks, region, updateType);
        result.updated += groupResult.updated;
        result.failed += groupResult.failed;
        result.errors.push(...groupResult.errors);
      }

      // Update statistics
      const updateTime = Date.now() - startTime;
      this.updateStats(result.updated > 0, updateTime);
      
      result.success = result.updated > 0 || result.failed === 0;
      this.lastUpdateTime = new Date();
      
      console.log(`[StockPriceScheduler] ${updateType} update completed: ${result.updated} updated, ${result.failed} failed in ${updateTime}ms`);
      
    } catch (error) {
      console.error('[StockPriceScheduler] Critical error during stock update:', error);
      result.errors.push(`Critical error: ${error.message}`);
      this.failedUpdateCount++;
    } finally {
      this.isUpdating = false;
    }

    return result;
  }

  /**
   * Get all unique stock symbols from all users
   */
  async getAllUniqueStocks() {
    try {
      // This would typically query the database directly
      // For now, we'll use a placeholder approach
      const { Pool } = await import('pg');
      const pool = new Pool({
        host: process.env.POSTGRES_HOST || 'localhost',
        port: process.env.POSTGRES_PORT || 5432,
        database: process.env.POSTGRES_DB || 'financeapp',
        user: process.env.POSTGRES_USER || 'postgres',
        password: process.env.POSTGRES_PASSWORD || 'postgres123',
      });

      const query = 'SELECT DISTINCT symbol FROM stocks WHERE symbol IS NOT NULL AND symbol != \'\'';
      const result = await pool.query(query);
      await pool.end();
      
      return result.rows.map(row => row.symbol);
    } catch (error) {
      console.error('[StockPriceScheduler] Failed to get unique stocks:', error);
      return [];
    }
  }

  /**
   * Group stocks by region for optimized API provider selection
   */
  groupStocksByRegion(stocks) {
    const groups = {
      indian: [],
      us: [],
      other: []
    };

    stocks.forEach(symbol => {
      if (this.isIndianStock(symbol)) {
        groups.indian.push(symbol);
      } else if (this.isUSStock(symbol)) {
        groups.us.push(symbol);
      } else {
        groups.other.push(symbol);
      }
    });

    return groups;
  }

  /**
   * Check if a stock symbol is Indian
   */
  isIndianStock(symbol) {
    // Check if it's already in .NS format or matches known Indian symbols
    if (symbol.endsWith('.NS') || symbol.endsWith('.BO')) {
      return true;
    }
    
    // List of common Indian stock symbols
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
   * Check if a stock symbol is US
   */
  isUSStock(symbol) {
    // Simple heuristic: most US stocks are short (1-5 chars) and don't have suffixes
    return symbol.length <= 5 && !symbol.includes('.') && !this.isIndianStock(symbol);
  }

  /**
   * Update a group of stocks with region-appropriate provider strategy
   */
  async updateStockGroup(stocks, region, updateType) {
    const result = { updated: 0, failed: 0, errors: [] };
    
    try {
      // Select providers based on region and current rate limits
      const providers = this.selectProvidersForRegion(region);
      
      if (providers.length === 0) {
        const error = `No available providers for ${region} stocks`;
        console.error(`[StockPriceScheduler] ${error}`);
        result.errors.push(error);
        result.failed = stocks.length;
        return result;
      }

      // Try providers in order until successful or all fail
      for (const provider of providers) {
        if (await this.isProviderRateLimited(provider)) {
          console.log(`[StockPriceScheduler] Provider ${provider.name} is rate limited, skipping`);
          continue;
        }

        try {
          console.log(`[StockPriceScheduler] Attempting to update ${stocks.length} ${region} stocks using ${provider.name}`);
          
          // Extract symbols from stocks array
          const symbols = stocks.map(stock => stock.symbol || stock);
          
          const priceResults = await fetchBatchStockPrices(symbols);
          
          // Count successful and failed updates
          let updated = 0;
          let failed = 0;
          
          for (const symbol of symbols) {
            if (priceResults[symbol] !== null && priceResults[symbol] !== undefined) {
              updated++;
            } else {
              failed++;
            }
          }
          
          if (updated > 0) {
            result.updated += updated;
            result.failed += failed;
            
            // Mark provider as recently used
            this.providerLastUsed.set(provider.name, Date.now());
            
            console.log(`[StockPriceScheduler] Successfully updated ${updated} stocks using ${provider.name}`);
            break; // Success, no need to try other providers
          }
        } catch (providerError) {
          console.error(`[StockPriceScheduler] Provider ${provider.name} failed:`, providerError.message);
          
          // Check if this is a rate limit error
          if (providerError.message.includes('429') || providerError.message.includes('rate limit')) {
            this.markProviderRateLimited(provider.name);
          }
          
          result.errors.push(`${provider.name}: ${providerError.message}`);
        }
      }

      // If no provider succeeded, mark all as failed
      if (result.updated === 0) {
        result.failed = stocks.length;
      }

    } catch (error) {
      console.error(`[StockPriceScheduler] Failed to update ${region} stock group:`, error);
      result.errors.push(`Group update failed: ${error.message}`);
      result.failed = stocks.length;
    }

    return result;
  }

  /**
   * Select the best providers for a specific region
   */
  selectProvidersForRegion(region) {
    const allProviders = [...availableProviders];
    
    switch (region) {
      case 'indian':
        // For Indian stocks, prefer Yahoo Finance (with .NS suffix) then Alpha Vantage
        return [
          allProviders.find(p => p.name === 'Yahoo Finance'),
          allProviders.find(p => p.name === 'Alpha Vantage'),
          allProviders.find(p => p.name === 'Financial Modeling Prep')
        ].filter(Boolean);
        
      case 'us':
        // For US stocks, prefer FMP then Alpha Vantage then Yahoo
        return [
          allProviders.find(p => p.name === 'Financial Modeling Prep'),
          allProviders.find(p => p.name === 'Alpha Vantage'),
          allProviders.find(p => p.name === 'Yahoo Finance')
        ].filter(Boolean);
        
      default:
        // For other stocks, try all providers
        return allProviders;
    }
  }

  /**
   * Check if a provider is currently rate limited
   */
  async isProviderRateLimited(provider) {
    const rateLimitInfo = this.providerRateLimits.get(provider.name);
    if (!rateLimitInfo) return false;
    
    const now = Date.now();
    const timeSinceLimit = now - rateLimitInfo.timestamp;
    
    // Rate limit expires after the specified duration
    if (timeSinceLimit > rateLimitInfo.duration) {
      this.providerRateLimits.delete(provider.name);
      return false;
    }
    
    return true;
  }

  /**
   * Mark a provider as rate limited
   */
  markProviderRateLimited(providerName, duration = 10 * 60 * 1000) { // 10 minutes default
    console.log(`[StockPriceScheduler] Marking ${providerName} as rate limited for ${duration / 1000} seconds`);
    this.providerRateLimits.set(providerName, {
      timestamp: Date.now(),
      duration: duration
    });
  }

  /**
   * Update internal statistics
   */
  updateStats(success, updateTime) {
    this.stats.totalUpdates++;
    
    if (success) {
      this.stats.successfulUpdates++;
      this.stats.lastSuccessfulUpdate = new Date();
      this.failedUpdateCount = 0; // Reset failed count on success
    } else {
      this.stats.failedUpdates++;
      this.failedUpdateCount++;
    }
    
    // Update average update time
    this.stats.averageUpdateTime = 
      (this.stats.averageUpdateTime * (this.stats.totalUpdates - 1) + updateTime) / this.stats.totalUpdates;
  }

  /**
   * Get current scheduler statistics
   */
  getStats() {
    return {
      ...this.stats,
      isRunning: this.isRunning,
      isUpdating: this.isUpdating,
      lastUpdateTime: this.lastUpdateTime,
      failedUpdateCount: this.failedUpdateCount,
      rateLimitedProviders: Array.from(this.providerRateLimits.keys())
    };
  }

  /**
   * Force immediate update (for manual triggers)
   */
  async forceUpdate() {
    console.log('[StockPriceScheduler] Force update requested');
    return await this.updateAllStocks('manual_force');
  }
}

// Create singleton instance
const scheduler = new StockPriceScheduler();

export default scheduler;
export { StockPriceScheduler };
