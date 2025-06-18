/**
 * Stock Price Update Monitoring and Alerting System
 * Tracks the health of price updates and provides alerts for failures
 */

class StockPriceMonitor {
  constructor() {
    this.metrics = {
      totalUpdates: 0,
      successfulUpdates: 0,
      failedUpdates: 0,
      lastUpdateTime: null,
      lastSuccessfulUpdate: null,
      consecutiveFailures: 0,
      averageUpdateTime: 0,
      providerMetrics: new Map(),
      stockMetrics: new Map()
    };

    this.alerts = [];
    this.alertThresholds = {
      maxConsecutiveFailures: 3,
      maxTimeSinceLastUpdate: 24 * 60 * 60 * 1000, // 24 hours
      maxTimeSinceLastSuccess: 12 * 60 * 60 * 1000, // 12 hours
      maxAverageUpdateTime: 5 * 60 * 1000, // 5 minutes
      minSuccessRate: 0.8 // 80%
    };

    this.notificationHandlers = [];
  }

  /**
   * Record a price update attempt
   */
  recordUpdate(result) {
    const now = Date.now();
    
    this.metrics.totalUpdates++;
    this.metrics.lastUpdateTime = new Date();
    
    if (result.success) {
      this.metrics.successfulUpdates++;
      this.metrics.lastSuccessfulUpdate = new Date();
      this.metrics.consecutiveFailures = 0;
    } else {
      this.metrics.failedUpdates++;
      this.metrics.consecutiveFailures++;
    }

    // Update average time if provided
    if (result.duration) {
      this.updateAverageTime(result.duration);
    }

    // Record provider-specific metrics
    if (result.providerMetrics) {
      this.recordProviderMetrics(result.providerMetrics);
    }

    // Record stock-specific metrics
    if (result.stockResults) {
      this.recordStockMetrics(result.stockResults);
    }

    // Check for alerts
    this.checkAlerts();
  }

  /**
   * Update average update time
   */
  updateAverageTime(newTime) {
    if (this.metrics.totalUpdates === 1) {
      this.metrics.averageUpdateTime = newTime;
    } else {
      this.metrics.averageUpdateTime = 
        (this.metrics.averageUpdateTime * (this.metrics.totalUpdates - 1) + newTime) / this.metrics.totalUpdates;
    }
  }

  /**
   * Record provider-specific metrics
   */
  recordProviderMetrics(providerMetrics) {
    for (const [providerName, metrics] of Object.entries(providerMetrics)) {
      if (!this.metrics.providerMetrics.has(providerName)) {
        this.metrics.providerMetrics.set(providerName, {
          totalRequests: 0,
          successfulRequests: 0,
          failedRequests: 0,
          rateLimitErrors: 0,
          timeoutErrors: 0,
          lastUsed: null,
          averageResponseTime: 0
        });
      }

      const providerStats = this.metrics.providerMetrics.get(providerName);
      providerStats.totalRequests++;
      providerStats.lastUsed = new Date();

      if (metrics.success) {
        providerStats.successfulRequests++;
      } else {
        providerStats.failedRequests++;
        
        if (metrics.error && metrics.error.includes('429')) {
          providerStats.rateLimitErrors++;
        }
        
        if (metrics.error && metrics.error.includes('timeout')) {
          providerStats.timeoutErrors++;
        }
      }

      if (metrics.responseTime) {
        providerStats.averageResponseTime = 
          (providerStats.averageResponseTime * (providerStats.totalRequests - 1) + metrics.responseTime) / providerStats.totalRequests;
      }
    }
  }

  /**
   * Record stock-specific metrics
   */
  recordStockMetrics(stockResults) {
    for (const [symbol, result] of Object.entries(stockResults)) {
      if (!this.metrics.stockMetrics.has(symbol)) {
        this.metrics.stockMetrics.set(symbol, {
          totalUpdates: 0,
          successfulUpdates: 0,
          lastUpdate: null,
          lastSuccessfulUpdate: null,
          consecutiveFailures: 0
        });
      }

      const stockStats = this.metrics.stockMetrics.get(symbol);
      stockStats.totalUpdates++;
      stockStats.lastUpdate = new Date();

      if (result.success && result.price !== null) {
        stockStats.successfulUpdates++;
        stockStats.lastSuccessfulUpdate = new Date();
        stockStats.consecutiveFailures = 0;
      } else {
        stockStats.consecutiveFailures++;
      }
    }
  }

  /**
   * Check for alert conditions
   */
  checkAlerts() {
    const now = Date.now();
    const newAlerts = [];

    // Check consecutive failures
    if (this.metrics.consecutiveFailures >= this.alertThresholds.maxConsecutiveFailures) {
      newAlerts.push({
        type: 'consecutive_failures',
        severity: 'high',
        message: `${this.metrics.consecutiveFailures} consecutive update failures`,
        timestamp: new Date(),
        data: { consecutiveFailures: this.metrics.consecutiveFailures }
      });
    }

    // Check time since last update
    if (this.metrics.lastUpdateTime) {
      const timeSinceLastUpdate = now - this.metrics.lastUpdateTime.getTime();
      if (timeSinceLastUpdate > this.alertThresholds.maxTimeSinceLastUpdate) {
        newAlerts.push({
          type: 'stale_updates',
          severity: 'high',
          message: `No updates for ${Math.floor(timeSinceLastUpdate / (60 * 60 * 1000))} hours`,
          timestamp: new Date(),
          data: { timeSinceLastUpdate }
        });
      }
    }

    // Check time since last successful update
    if (this.metrics.lastSuccessfulUpdate) {
      const timeSinceLastSuccess = now - this.metrics.lastSuccessfulUpdate.getTime();
      if (timeSinceLastSuccess > this.alertThresholds.maxTimeSinceLastSuccess) {
        newAlerts.push({
          type: 'no_successful_updates',
          severity: 'critical',
          message: `No successful updates for ${Math.floor(timeSinceLastSuccess / (60 * 60 * 1000))} hours`,
          timestamp: new Date(),
          data: { timeSinceLastSuccess }
        });
      }
    }

    // Check success rate
    if (this.metrics.totalUpdates >= 10) { // Only check after sufficient data
      const successRate = this.metrics.successfulUpdates / this.metrics.totalUpdates;
      if (successRate < this.alertThresholds.minSuccessRate) {
        newAlerts.push({
          type: 'low_success_rate',
          severity: 'medium',
          message: `Success rate is ${(successRate * 100).toFixed(1)}% (threshold: ${(this.alertThresholds.minSuccessRate * 100)}%)`,
          timestamp: new Date(),
          data: { successRate, threshold: this.alertThresholds.minSuccessRate }
        });
      }
    }

    // Check average update time
    if (this.metrics.averageUpdateTime > this.alertThresholds.maxAverageUpdateTime) {
      newAlerts.push({
        type: 'slow_updates',
        severity: 'low',
        message: `Average update time is ${Math.floor(this.metrics.averageUpdateTime / 1000)} seconds`,
        timestamp: new Date(),
        data: { averageUpdateTime: this.metrics.averageUpdateTime }
      });
    }

    // Check provider-specific issues
    for (const [providerName, stats] of this.metrics.providerMetrics.entries()) {
      if (stats.totalRequests >= 5) { // Only check after sufficient data
        const providerSuccessRate = stats.successfulRequests / stats.totalRequests;
        if (providerSuccessRate < 0.5) {
          newAlerts.push({
            type: 'provider_issues',
            severity: 'medium',
            message: `Provider ${providerName} has low success rate: ${(providerSuccessRate * 100).toFixed(1)}%`,
            timestamp: new Date(),
            data: { providerName, successRate: providerSuccessRate }
          });
        }

        // Check for excessive rate limiting
        const rateLimitRate = stats.rateLimitErrors / stats.totalRequests;
        if (rateLimitRate > 0.3) {
          newAlerts.push({
            type: 'rate_limiting',
            severity: 'medium',
            message: `Provider ${providerName} is frequently rate limited (${(rateLimitRate * 100).toFixed(1)}% of requests)`,
            timestamp: new Date(),
            data: { providerName, rateLimitRate }
          });
        }
      }
    }

    // Add new alerts and notify
    if (newAlerts.length > 0) {
      this.alerts.push(...newAlerts);
      this.notifyAlerts(newAlerts);
      
      // Keep only recent alerts (last 100)
      if (this.alerts.length > 100) {
        this.alerts = this.alerts.slice(-100);
      }
    }
  }

  /**
   * Notify about new alerts
   */
  async notifyAlerts(alerts) {
    for (const alert of alerts) {
      console.log(`[StockPriceMonitor] ALERT [${alert.severity.toUpperCase()}] ${alert.type}: ${alert.message}`);
      
      // Call registered notification handlers
      for (const handler of this.notificationHandlers) {
        try {
          await handler(alert);
        } catch (error) {
          console.error('[StockPriceMonitor] Notification handler failed:', error);
        }
      }
    }
  }

  /**
   * Register a notification handler
   */
  addNotificationHandler(handler) {
    this.notificationHandlers.push(handler);
  }

  /**
   * Get current metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      providerMetrics: Object.fromEntries(this.metrics.providerMetrics),
      stockMetrics: Object.fromEntries(this.metrics.stockMetrics),
      successRate: this.metrics.totalUpdates > 0 ? 
        this.metrics.successfulUpdates / this.metrics.totalUpdates : 0
    };
  }

  /**
   * Get recent alerts
   */
  getAlerts(limit = 20) {
    return this.alerts.slice(-limit).reverse();
  }

  /**
   * Get health status
   */
  getHealthStatus() {
    const now = Date.now();
    const metrics = this.getMetrics();
    
    let status = 'healthy';
    let issues = [];

    // Check for critical issues
    if (metrics.consecutiveFailures >= this.alertThresholds.maxConsecutiveFailures) {
      status = 'critical';
      issues.push(`${metrics.consecutiveFailures} consecutive failures`);
    }

    if (metrics.lastSuccessfulUpdate) {
      const timeSinceSuccess = now - metrics.lastSuccessfulUpdate.getTime();
      if (timeSinceSuccess > this.alertThresholds.maxTimeSinceLastSuccess) {
        status = 'critical';
        issues.push(`No successful updates for ${Math.floor(timeSinceSuccess / (60 * 60 * 1000))} hours`);
      }
    }

    // Check for warning issues
    if (status === 'healthy') {
      if (metrics.successRate < this.alertThresholds.minSuccessRate && metrics.totalUpdates >= 10) {
        status = 'warning';
        issues.push(`Low success rate: ${(metrics.successRate * 100).toFixed(1)}%`);
      }

      if (metrics.lastUpdateTime) {
        const timeSinceUpdate = now - metrics.lastUpdateTime.getTime();
        if (timeSinceUpdate > this.alertThresholds.maxTimeSinceLastUpdate * 0.8) {
          status = 'warning';
          issues.push(`Updates may be stale (${Math.floor(timeSinceUpdate / (60 * 60 * 1000))} hours since last update)`);
        }
      }
    }

    return {
      status,
      issues,
      metrics: {
        totalUpdates: metrics.totalUpdates,
        successRate: metrics.successRate,
        consecutiveFailures: metrics.consecutiveFailures,
        lastUpdateTime: metrics.lastUpdateTime,
        lastSuccessfulUpdate: metrics.lastSuccessfulUpdate,
        averageUpdateTime: metrics.averageUpdateTime
      },
      recentAlerts: this.getAlerts(5)
    };
  }

  /**
   * Generate a detailed report
   */
  generateReport() {
    const metrics = this.getMetrics();
    const health = this.getHealthStatus();
    
    return {
      timestamp: new Date(),
      health,
      summary: {
        totalUpdates: metrics.totalUpdates,
        successfulUpdates: metrics.successfulUpdates,
        failedUpdates: metrics.failedUpdates,
        successRate: `${(metrics.successRate * 100).toFixed(1)}%`,
        averageUpdateTime: `${Math.floor(metrics.averageUpdateTime / 1000)}s`,
        lastUpdate: metrics.lastUpdateTime,
        lastSuccessfulUpdate: metrics.lastSuccessfulUpdate
      },
      providers: Object.fromEntries(
        Object.entries(metrics.providerMetrics).map(([name, stats]) => [
          name,
          {
            requests: stats.totalRequests,
            successRate: `${((stats.successfulRequests / stats.totalRequests) * 100).toFixed(1)}%`,
            rateLimitErrors: stats.rateLimitErrors,
            averageResponseTime: `${Math.floor(stats.averageResponseTime)}ms`,
            lastUsed: stats.lastUsed
          }
        ])
      ),
      topFailingStocks: this.getTopFailingStocks(10),
      recentAlerts: this.getAlerts(10)
    };
  }

  /**
   * Get stocks with the most failures
   */
  getTopFailingStocks(limit = 10) {
    return Array.from(this.metrics.stockMetrics.entries())
      .map(([symbol, stats]) => ({
        symbol,
        consecutiveFailures: stats.consecutiveFailures,
        successRate: stats.totalUpdates > 0 ? 
          (stats.successfulUpdates / stats.totalUpdates) : 0,
        lastSuccessfulUpdate: stats.lastSuccessfulUpdate
      }))
      .filter(stock => stock.consecutiveFailures > 0 || stock.successRate < 0.8)
      .sort((a, b) => b.consecutiveFailures - a.consecutiveFailures)
      .slice(0, limit);
  }

  /**
   * Reset metrics (useful for testing)
   */
  reset() {
    this.metrics = {
      totalUpdates: 0,
      successfulUpdates: 0,
      failedUpdates: 0,
      lastUpdateTime: null,
      lastSuccessfulUpdate: null,
      consecutiveFailures: 0,
      averageUpdateTime: 0,
      providerMetrics: new Map(),
      stockMetrics: new Map()
    };
    this.alerts = [];
  }
}

// Create singleton instance
const stockPriceMonitor = new StockPriceMonitor();

// Add a simple console notification handler
stockPriceMonitor.addNotificationHandler(async (alert) => {
  // In a production environment, you might send emails, Slack messages, etc.
  console.log(`🚨 [ALERT] ${alert.type}: ${alert.message}`);
});

export default stockPriceMonitor;
export { StockPriceMonitor };
