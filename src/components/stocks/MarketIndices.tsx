
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
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
      <Card className="kite-card bg-white dark:bg-gray-800 shadow-sm h-[100px]">
        <CardContent className="p-2 h-full">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-xs font-medium text-gray-600 dark:text-gray-400">Market Indices</h3>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex flex-col">
                <Skeleton className="h-3 w-16 mb-1" />
                <Skeleton className="h-3 w-12" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="kite-card bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm h-[100px]">
      <CardContent className="p-2 h-full">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-xs font-medium text-gray-600 dark:text-gray-400">Market Indices</h3>
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground">
              {formatTime(lastUpdated)}
            </span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={refreshIndices} 
                    disabled={refreshing}
                    className="h-5 w-5 p-0"
                  >
                    <RefreshCw className={`h-3 w-3 ${refreshing ? 'animate-spin' : ''}`} />
                    <span className="sr-only">Refresh</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Refresh market data</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        
        <div className="grid grid-cols-4 gap-x-4 gap-y-1 overflow-hidden">
          {indices.slice(0, 8).map((index) => (
            <div key={index.symbol} className="flex items-center justify-between text-xs">
              <div className="font-medium truncate mr-1 text-gray-700 dark:text-gray-300">{index.name}</div>
              <div className={`flex items-center whitespace-nowrap ${index.changePercent >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {index.changePercent >= 0 ? (
                  <TrendingUp className="h-3 w-3 mr-0.5" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-0.5" />
                )}
                <span className="font-medium">
                  {index.changePercent >= 0 ? '+' : ''}{index.changePercent.toFixed(2)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
