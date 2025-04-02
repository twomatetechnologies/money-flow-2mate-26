
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
  const totalValue = stocks.reduce((sum, stock) => sum + stock.value, 0);
  const totalGain = stocks.reduce((sum, stock) => {
    const gain = (stock.currentPrice - stock.averageBuyPrice) * stock.quantity;
    return sum + gain;
  }, 0);
  
  const percentGain = (totalGain / (totalValue - totalGain)) * 100;
  const isPositive = percentGain >= 0;

  // Get top 3 performing stocks
  const sortedStocks = [...stocks].sort((a, b) => 
    (b.currentPrice - b.averageBuyPrice) * b.quantity - 
    (a.currentPrice - a.averageBuyPrice) * a.quantity
  );
  const topStocks = sortedStocks.slice(0, 3);

  return (
    <Card className="finance-card">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <span>Stock Portfolio</span>
          <div className="flex items-center">
            {isPositive ? (
              <TrendingUp className="h-4 w-4 mr-1 trend-up" />
            ) : (
              <TrendingDown className="h-4 w-4 mr-1 trend-down" />
            )}
            <span className={`text-sm font-medium ${isPositive ? 'trend-up' : 'trend-down'}`}>
              {isPositive ? '+' : ''}{percentGain.toFixed(2)}%
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
          {topStocks.map(stock => (
            <div key={stock.id} className="flex items-center justify-between">
              <div className="flex flex-col">
                <div className="font-medium">{stock.symbol}</div>
                <div className="text-xs text-finance-gray">{stock.name}</div>
              </div>
              <div className="flex flex-col items-end">
                <div className="font-medium">₹{stock.currentPrice.toLocaleString()}</div>
                <div className={`text-xs ${stock.changePercent >= 0 ? 'trend-up' : 'trend-down'}`}>
                  {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                </div>
              </div>
            </div>
          ))}
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
