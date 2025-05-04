
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StockHolding } from '@/types';
import { TrendingUp, TrendingDown, PieChart, LineChart, ArrowUpRight } from 'lucide-react';

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
    <div className="grid gap-6 md:grid-cols-3 h-full">
      <Card className="finance-card overflow-hidden relative h-full">
        <div className={`absolute inset-0 opacity-5 ${totalValue >= totalInvestment ? 'bg-gradient-to-br from-green-300 to-green-800' : 'bg-gradient-to-br from-red-300 to-red-800'}`} />
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <LineChart className="h-5 w-5" />
            Current Value
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="stat-value text-3xl font-bold">₹{totalValue.toLocaleString()}</div>
          <div className="mt-2 text-sm text-muted-foreground">Total portfolio value</div>
        </CardContent>
      </Card>
      <Card className="finance-card overflow-hidden relative h-full">
        <div className="absolute inset-0 opacity-5 bg-gradient-to-br from-blue-300 to-blue-800" />
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Total Investment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="stat-value text-3xl font-bold">₹{totalInvestment.toLocaleString()}</div>
          <div className="mt-2 text-sm text-muted-foreground">Purchase value</div>
        </CardContent>
      </Card>
      <Card className={`finance-card overflow-hidden relative h-full ${totalGain >= 0 ? 'border-green-100 dark:border-green-900' : 'border-red-100 dark:border-red-900'}`}>
        <div className={`absolute inset-0 opacity-5 ${totalGain >= 0 ? 'bg-gradient-to-br from-green-300 to-green-800' : 'bg-gradient-to-br from-red-300 to-red-800'}`} />
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            {totalGain >= 0 ? (
              <ArrowUpRight className="h-5 w-5" />
            ) : (
              <TrendingDown className="h-5 w-5" />
            )}
            Total Gain/Loss
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`stat-value text-3xl font-bold ${totalGain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {totalGain >= 0 ? '+' : ''}₹{totalGain.toLocaleString()}
          </div>
          <div className={`flex items-center mt-2 ${totalGain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {totalGain >= 0 ? (
              <TrendingUp className="h-4 w-4 mr-1" />
            ) : (
              <TrendingDown className="h-4 w-4 mr-1" />
            )}
            <span className="font-medium">
              {percentGain >= 0 ? '+' : ''}{percentGain.toFixed(2)}%
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
