
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, RefreshCw, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react'; // Added AlertTriangle
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useMarketIndices } from '@/hooks/useMarketIndices';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export function MarketIndices() {
  const { indices, loading, error, refreshing, lastUpdated, refreshIndices } = useMarketIndices(60000);
  const [isExpanded, setIsExpanded] = useState(true); // State for expand/collapse

  const formatTime = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  // Determine if all fetched indices are simulated
  const allSimulated = !loading && indices.length > 0 && indices.every(index => index.isSimulated);
  // Determine if there's a significant error and no data to show
  const showErrorState = !loading && !!error && indices.length === 0;


  if (loading && !indices.length && !error) { // Show detailed skeleton only on initial load without data and no immediate error
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
            {lastUpdated && !allSimulated && !showErrorState && ( // Only show time if data is not fully simulated or errored
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
        )}>
          {loading && indices.length > 0 && !error && ( // Show subtle loading bar if refreshing existing data and no major error
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-1 mb-2 rounded-full overflow-hidden">
              <div className="bg-primary h-1 animate-pulse w-1/2"></div>
            </div>
          )}

          {showErrorState ? (
            <div className="text-center py-4 text-sm text-red-600 dark:text-red-400 flex flex-col items-center">
              <AlertTriangle className="h-6 w-6 mb-2" />
              <p className="font-semibold">Error Loading Market Data</p>
              <p>Could not retrieve live market indices. Please try refreshing, or check back later.</p>
              {error?.message && <p className="text-xs mt-1 text-muted-foreground">Details: {error.message}</p>}
            </div>
          ) : allSimulated ? (
            <div className="text-center py-4 text-sm text-orange-600 dark:text-orange-400 flex flex-col items-center">
              <AlertTriangle className="h-6 w-6 mb-2" />
              <p className="font-semibold">Live Data Unavailable</p>
              <p>Currently unable to fetch live market data. Displaying indices is paused to avoid showing potentially inaccurate simulated data.</p>
            </div>
          ) : indices.length === 0 && !loading ? (
             <div className="text-center py-4 text-sm text-muted-foreground">
                No market index data available at the moment.
             </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-3">
              {indices.slice(0, 8).map((index) => (
                <div key={index.symbol} className="text-xs">
                  <div className="flex justify-between items-baseline">
                    <span className="font-medium text-slate-700 dark:text-slate-300 truncate pr-2" title={index.name}>
                      {index.name}
                      {index.isSimulated && (
                        <TooltipProvider>
                          <Tooltip delayDuration={100}>
                            <TooltipTrigger asChild>
                              <span className="ml-1 text-orange-500">*</span>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                              <p className="text-xs">Simulated data</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
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

