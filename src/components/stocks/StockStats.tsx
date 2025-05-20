import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { StockHolding } from '@/types';
import { TrendingUp, TrendingDown, PieChart, LineChart, ArrowUpRight } from 'lucide-react';

interface StockStatsProps {
  displayedStocks: StockHolding[];
}

export const StockStats: React.FC<StockStatsProps> = ({ displayedStocks }) => {
  // Use database-computed values
  const totalValue = displayedStocks.reduce((sum, stock) => sum + (stock.value || 0), 0);
  const totalInvestment = displayedStocks.reduce(
    (sum, stock) => sum + (stock.quantity * stock.averageBuyPrice),
    0
  );
  const totalGain = totalValue - totalInvestment;
  const percentGain = totalInvestment > 0 ? (totalGain / totalInvestment) * 100 : 0;

  return (
    <div className="grid grid-cols-3 gap-4">
      <Card className="kite-card bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm h-[100px]">
        <div className="h-full flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-1 text-xs font-medium text-gray-600 dark:text-gray-400">
            <LineChart className="h-3.5 w-3.5" />
            Current Value
          </div>
          <div className="text-lg font-bold text-gray-900 dark:text-gray-100">₹{totalValue.toLocaleString()}</div>
        </div>
      </Card>
      <Card className="kite-card bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm h-[100px]">
        <div className="h-full flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-1 text-xs font-medium text-gray-600 dark:text-gray-400">
            <PieChart className="h-3.5 w-3.5" />
            Investment
          </div>
          <div className="text-lg font-bold text-gray-900 dark:text-gray-100">₹{totalInvestment.toLocaleString()}</div>
        </div>
      </Card>
      <Card className={`kite-card border shadow-sm h-[100px] ${totalGain >= 0 ? 'bg-green-50 dark:bg-green-900/10 border-green-100 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-800'}`}>
        <div className="h-full flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-1 text-xs font-medium text-gray-600 dark:text-gray-400">
            {totalGain >= 0 ? (
              <ArrowUpRight className="h-3.5 w-3.5" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5" />
            )}
            Gain/Loss
          </div>
          <div className="flex items-center">
            <div className={`text-lg font-bold ${totalGain >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {totalGain >= 0 ? '+' : ''}₹{totalGain.toLocaleString()}
            </div>
            <div className={`ml-2 text-xs ${totalGain >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              ({percentGain >= 0 ? '+' : ''}{percentGain.toFixed(2)}%)
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
