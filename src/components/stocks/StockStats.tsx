
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
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
    <div className="grid grid-cols-3 gap-4">
      <Card className="finance-card overflow-hidden relative h-[100px]">
        <div className={`absolute inset-0 opacity-5 ${totalValue >= totalInvestment ? 'bg-gradient-to-br from-green-300 to-green-800' : 'bg-gradient-to-br from-red-300 to-red-800'}`} />
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-1 text-sm font-medium">
            <LineChart className="h-4 w-4" />
            Current Value
          </div>
          <div className="text-xl font-bold">₹{totalValue.toLocaleString()}</div>
        </CardContent>
      </Card>
      <Card className="finance-card overflow-hidden relative h-[100px]">
        <div className="absolute inset-0 opacity-5 bg-gradient-to-br from-blue-300 to-blue-800" />
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-1 text-sm font-medium">
            <PieChart className="h-4 w-4" />
            Investment
          </div>
          <div className="text-xl font-bold">₹{totalInvestment.toLocaleString()}</div>
        </CardContent>
      </Card>
      <Card className={`finance-card overflow-hidden relative h-[100px] ${totalGain >= 0 ? 'border-green-100 dark:border-green-900' : 'border-red-100 dark:border-red-900'}`}>
        <div className={`absolute inset-0 opacity-5 ${totalGain >= 0 ? 'bg-gradient-to-br from-green-300 to-green-800' : 'bg-gradient-to-br from-red-300 to-red-800'}`} />
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-1 text-sm font-medium">
            {totalGain >= 0 ? (
              <ArrowUpRight className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            Gain/Loss
          </div>
          <div className="flex items-center">
            <div className={`text-xl font-bold ${totalGain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totalGain >= 0 ? '+' : ''}₹{totalGain.toLocaleString()}
            </div>
            <div className={`ml-2 text-sm ${totalGain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ({percentGain >= 0 ? '+' : ''}{percentGain.toFixed(2)}%)
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
