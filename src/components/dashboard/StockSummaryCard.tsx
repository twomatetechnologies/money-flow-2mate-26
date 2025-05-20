
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StockHolding } from '@/types';
import { TrendingUp, TrendingDown, LineChart, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatIndianNumber } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface StockSummaryCardProps {
  stocks: StockHolding[];
}

export function StockSummaryCard({ stocks = [] }: StockSummaryCardProps) {
  const safeStocks = Array.isArray(stocks) ? stocks.filter(Boolean) : []; // Filter out null/undefined stocks
  
  const totalValue = safeStocks.reduce((sum, stock) => {
    // Use stock.value directly as it's calculated by DB: quantity * COALESCE(currentPrice, averageBuyPrice)
    return sum + (stock?.value || 0);
  }, 0);
  
  const totalInvestment = safeStocks.reduce((sum, stock) => {
    const buyPrice = stock?.averageBuyPrice || 0; // This should be correctly populated now
    const quantity = stock?.quantity || 0;
    return sum + (buyPrice * quantity);
  }, 0);
  
  const totalGain = totalValue - totalInvestment;
  const percentGain = totalInvestment > 0 ? (totalGain / totalInvestment) * 100 : 0;
  
  const sortedStocks = [...safeStocks].sort((a, b) => {
    // Calculate gain for sorting, ensuring values are numbers
    const gainA = (Number(a?.value) || 0) - ((Number(a?.averageBuyPrice) || 0) * (Number(a?.quantity) || 0));
    const gainB = (Number(b?.value) || 0) - ((Number(b?.averageBuyPrice) || 0) * (Number(b?.quantity) || 0));
    return gainB - gainA; // Sort by highest absolute gain
  });
  
  const topStocks = sortedStocks.slice(0, 3);

  return (
    <Card className="finance-card">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LineChart className="h-5 w-5" />
            <span>Stock Portfolio</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-sm">
                  <p>Current Stock Value is the sum of (Current Price × Quantity) for all stocks, or (Purchase Price × Quantity) if current price isn't available.</p>
                  <p className="mt-2">Performance percentage shows overall gain/loss compared to your total purchase cost.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex items-center">
            {percentGain >= 0 ? (
              <TrendingUp className="h-4 w-4 mr-1 trend-up" />
            ) : (
              <TrendingDown className="h-4 w-4 mr-1 trend-down" />
            )}
            <span className={`text-sm font-medium ${percentGain >= 0 ? 'trend-up' : 'trend-down'}`}>
              {percentGain >= 0 ? '+' : ''}{percentGain.toFixed(2)}%
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="stat-value">{formatIndianNumber(totalValue)}</div>
          <div className="stat-label">Current Value</div>
        </div>
        <div className="space-y-3">
          <div className="text-sm font-medium text-finance-gray">Top Performers</div>
          {topStocks.length > 0 ? (
            topStocks.map(stock => {
              // stock object is already validated by safeStocks filter
              const currentPrice = stock.currentPrice || 0;
              const averageBuyPrice = stock.averageBuyPrice || 0;
              // Calculate gain percent for individual stock
              const individualGainPercent = averageBuyPrice > 0 ? 
                ((currentPrice - averageBuyPrice) / averageBuyPrice) * 100 : 
                (currentPrice > 0 ? Infinity : 0); // Handle case where averageBuyPrice is 0

              return (
                <div key={stock.id} className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <div className="font-medium">{stock.symbol}</div>
                    <div className="text-xs text-finance-gray">{stock.name}</div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="font-medium">{formatIndianNumber(currentPrice)}</div>
                    <div className={`text-xs ${individualGainPercent >= 0 ? 'trend-up' : 'trend-down'}`}>
                      {averageBuyPrice === 0 && currentPrice > 0 ? 'N/A' : `${individualGainPercent >= 0 ? '+' : ''}${individualGainPercent.toFixed(2)}%`}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-2 text-muted-foreground">No stocks in portfolio</div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" variant="outline" asChild>
          <Link to="/stocks">View All Stocks</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
