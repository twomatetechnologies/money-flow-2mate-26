
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, ArrowUpDown, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useMarketIndices } from '@/hooks/useMarketIndices';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export function MarketIndices() {
  const { indices, loading, refreshing, lastUpdated, refreshIndices } = useMarketIndices(60000);

  const formatTime = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <Card className="finance-card h-full">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between">
            <span>Market Indices</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-y-auto">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-5 w-24" />
                <div className="flex flex-col items-end">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-4 w-12 mt-1" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="finance-card h-full bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <span>Market Indices</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={refreshIndices} 
                  disabled={refreshing}
                  className="h-8 w-8 p-0"
                >
                  <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                  <span className="sr-only">Refresh</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Refresh market data</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent className="overflow-y-auto max-h-[240px]">
        <div className="space-y-3">
          {indices.map((index) => (
            <div key={index.symbol} className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3 last:border-0">
              <div>
                <div className="text-sm font-medium">{index.name}</div>
              </div>
              <div className="flex flex-col items-end">
                <div className="font-medium">₹{index.value.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                <div className={`text-xs flex items-center ${index.changePercent >= 0 ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}`}>
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
