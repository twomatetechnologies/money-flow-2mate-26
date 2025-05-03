
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, ArrowUpDown, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MarketIndex, fetchAllMarketIndices } from '@/services/marketIndicesService';
import { Skeleton } from '@/components/ui/skeleton';

export function MarketIndices() {
  const [indices, setIndices] = useState<MarketIndex[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadIndices = async () => {
    try {
      setRefreshing(true);
      const data = await fetchAllMarketIndices();
      setIndices(data);
      setLastUpdated(new Date());
      setLoading(false);
    } catch (error) {
      console.error('Error loading market indices:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadIndices();
    
    // Set up interval to refresh every 60 seconds
    const intervalId = setInterval(loadIndices, 60000);
    
    return () => clearInterval(intervalId);
  }, []);

  const handleManualRefresh = () => {
    loadIndices();
  };

  const formatTime = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <Card className="finance-card">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Market Indices</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="finance-card">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <span>Market Indices</span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleManualRefresh} 
            disabled={refreshing}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="sr-only">Refresh</span>
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {indices.map((index) => (
            <div key={index.symbol} className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">{index.name}</div>
              </div>
              <div className="flex flex-col items-end">
                <div className="font-medium">₹{index.value.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                <div className={`text-xs flex items-center ${index.changePercent >= 0 ? 'trend-up' : 'trend-down'}`}>
                  {index.changePercent >= 0 ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  )}
                  <span>
                    {index.changePercent >= 0 ? '+' : ''}{index.changePercent.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        {lastUpdated && (
          <div className="mt-4 text-xs text-muted-foreground text-center">
            Last updated: {formatTime(lastUpdated)}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
