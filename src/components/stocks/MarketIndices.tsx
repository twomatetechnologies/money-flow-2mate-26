
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react'; // Added ChevronDown, ChevronUp
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useMarketIndices } from '@/hooks/useMarketIndices';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export function MarketIndices() {
  const { indices, loading, refreshing, lastUpdated, refreshIndices } = useMarketIndices(60000);
  const [isExpanded, setIsExpanded] = useState(true); // State for expand/collapse

  const formatTime = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  if (loading && !indices.length) { // Show detailed skeleton only on initial load without data
    return (
      <Card className="shadow-md border-slate-200 dark:border-slate-700">
        <CardHeader className="py-3 px-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex justify-between items-center">
            <CardTitle className="text-base font-semibold text-slate-800 dark:text-slate-200">Market Indices</CardTitle>
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-1.5">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-12" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-md border-slate-200 dark:border-slate-700 transition-all duration-300 ease-in-out">
      <CardHeader className="py-3 px-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base font-semibold text-slate-800 dark:text-slate-200">Market Indices</CardTitle>
          <div className="flex items-center space-x-1">
            {lastUpdated && (
              <span className="text-xs text-muted-foreground mr-1">
                {formatTime(lastUpdated)}
              </span>
            )}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={refreshIndices} 
                    disabled={refreshing || loading}
                    className="h-7 w-7 hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                    <span className="sr-only">Refresh</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p className="text-xs">Refresh market data</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="h-7 w-7 hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    <span className="sr-only">{isExpanded ? 'Collapse' : 'Expand'}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p className="text-xs">{isExpanded ? 'Hide indices' : 'Show indices'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className={cn(
          "p-4 transition-all duration-500 ease-in-out overflow-hidden",
          // These classes are for tailwindcss-animate, if installed and configured for accordion-like behavior
          // "animate-accordion-down" 
        )}>
          {loading && indices.length > 0 && ( // Show subtle loading bar if refreshing existing data
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-1 mb-2 rounded-full overflow-hidden">
              <div className="bg-primary h-1 animate-pulse w-1/2"></div>
            </div>
          )}
          {indices.length === 0 && !loading ? (
             <div className="text-center py-4 text-sm text-muted-foreground">
                No market index data available.
             </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-3">
              {indices.slice(0, 8).map((index) => (
                <div key={index.symbol} className="text-xs">
                  <div className="flex justify-between items-baseline">
                    <span className="font-medium text-slate-700 dark:text-slate-300 truncate pr-2" title={index.name}>
                      {index.name}
                    </span>
                    <span className={`font-semibold whitespace-nowrap ${index.changePercent >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                       {index.changePercent >= 0 ? '+' : ''}{index.changePercent.toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline text-slate-500 dark:text-slate-400">
                    <span className="text-sm font-medium">
                      {index.value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                    </span>
                    <div className={`flex items-center text-xs ${index.change >= 0 ? 'text-green-500 dark:text-green-500' : 'text-red-500 dark:text-red-500'}`}>
                       {index.change >= 0 ? <TrendingUp className="h-3 w-3 mr-0.5" /> : <TrendingDown className="h-3 w-3 mr-0.5" />}
                       <span>{index.change >= 0 ? '+' : ''}{index.change.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
