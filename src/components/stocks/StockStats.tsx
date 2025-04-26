
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StockHolding } from '@/types';

interface StockStatsProps {
  displayedStocks: StockHolding[];
}

export const StockStats: React.FC<StockStatsProps> = ({ displayedStocks }) => {
  const totalValue = displayedStocks.reduce((sum, stock) => sum + stock.value, 0);
  const totalInvestment = displayedStocks.reduce(
    (sum, stock) => sum + stock.averageBuyPrice * stock.quantity,
    0
  );
  const totalGain = totalValue - totalInvestment;
  const percentGain = totalInvestment > 0 ? (totalGain / totalInvestment) * 100 : 0;

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <Card className="finance-card">
        <CardHeader className="pb-2">
          <CardTitle>Current Value</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="stat-value">₹{totalValue.toLocaleString()}</div>
        </CardContent>
      </Card>
      <Card className="finance-card">
        <CardHeader className="pb-2">
          <CardTitle>Total Investment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="stat-value">₹{totalInvestment.toLocaleString()}</div>
        </CardContent>
      </Card>
      <Card className="finance-card">
        <CardHeader className="pb-2">
          <CardTitle>Total Gain/Loss</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`stat-value ${totalGain >= 0 ? 'trend-up' : 'trend-down'}`}>
            {totalGain >= 0 ? '+' : ''}₹{totalGain.toLocaleString()} ({percentGain.toFixed(2)}%)
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
