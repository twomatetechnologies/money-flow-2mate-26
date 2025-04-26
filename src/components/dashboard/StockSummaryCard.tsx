
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StockHolding } from '@/types';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Link } from 'react-router-dom';

interface StockSummaryCardProps {
  stocks: StockHolding[];
}

export function StockSummaryCard({ stocks }: StockSummaryCardProps) {
  // Calculate total value of current holdings
  const totalValue = stocks.reduce((sum, stock) => sum + (stock.currentPrice * stock.quantity), 0);
  
  // Calculate total gain/loss
  const totalInvestment = stocks.reduce((sum, stock) => sum + (stock.averageBuyPrice * stock.quantity), 0);
  const totalGain = totalValue - totalInvestment;
  const percentGain = totalInvestment > 0 ? (totalGain / totalInvestment) * 100 : 0;
  
  // Get top 3 performing stocks based on absolute gain value
  const sortedStocks = [...stocks].sort((a, b) => {
    const gainA = (a.currentPrice - a.averageBuyPrice) * a.quantity;
    const gainB = (b.currentPrice - b.averageBuyPrice) * b.quantity;
    return gainB - gainA;
  });
  const topStocks = sortedStocks.slice(0, 3);

  return (
    <Card className="finance-card">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <span>Stock Portfolio</span>
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
          <div className="stat-value">₹{totalValue.toLocaleString()}</div>
          <div className="stat-label">Current Value</div>
        </div>
        <div className="space-y-3">
          <div className="text-sm font-medium text-finance-gray">Top Performers</div>
          {topStocks.length > 0 ? (
            topStocks.map(stock => {
              const gainPercent = ((stock.currentPrice - stock.averageBuyPrice) / stock.averageBuyPrice) * 100;
              return (
                <div key={stock.id} className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <div className="font-medium">{stock.symbol}</div>
                    <div className="text-xs text-finance-gray">{stock.name}</div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="font-medium">₹{stock.currentPrice.toLocaleString()}</div>
                    <div className={`text-xs ${gainPercent >= 0 ? 'trend-up' : 'trend-down'}`}>
                      {gainPercent >= 0 ? '+' : ''}{gainPercent.toFixed(2)}%
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
