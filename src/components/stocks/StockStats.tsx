
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { StockHolding } from '@/types';
import { TrendingUp, TrendingDown, PieChart, LineChart, ArrowUpRight, DollarSign, Landmark, Scale } from 'lucide-react'; // Added DollarSign, Landmark, Scale
import { cn } from '@/lib/utils'; // Import cn for conditional classes

interface StockStatsProps {
  displayedStocks: StockHolding[];
}

export const StockStats: React.FC<StockStatsProps> = ({ displayedStocks }) => {
  const totalValue = displayedStocks.reduce((sum, stock) => sum + (stock.value || 0), 0);
  const totalInvestment = displayedStocks.reduce(
    (sum, stock) => sum + (stock.quantity * stock.averageBuyPrice),
    0
  );
  const totalGain = totalValue - totalInvestment;
  const percentGain = totalInvestment > 0 ? (totalGain / totalInvestment) * 100 : 0;

  const stats = [
    {
      title: "Current Value",
      value: totalValue,
      icon: <DollarSign className="h-6 w-6 text-blue-500" />,
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      borderColor: "border-blue-200 dark:border-blue-700",
      textColor: "text-blue-700 dark:text-blue-300",
      valueColor: "text-blue-600 dark:text-blue-400",
    },
    {
      title: "Total Investment",
      value: totalInvestment,
      icon: <Landmark className="h-6 w-6 text-purple-500" />,
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
      borderColor: "border-purple-200 dark:border-purple-700",
      textColor: "text-purple-700 dark:text-purple-300",
      valueColor: "text-purple-600 dark:text-purple-400",
    },
    {
      title: "Overall Gain/Loss",
      value: totalGain,
      percent: percentGain,
      icon: totalGain >= 0 ? <TrendingUp className="h-6 w-6 text-green-500" /> : <TrendingDown className="h-6 w-6 text-red-500" />,
      bgColor: totalGain >= 0 ? "bg-green-50 dark:bg-green-900/20" : "bg-red-50 dark:bg-red-900/20",
      borderColor: totalGain >= 0 ? "border-green-200 dark:border-green-700" : "border-red-200 dark:border-red-700",
      textColor: totalGain >= 0 ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300",
      valueColor: totalGain >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400",
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {stats.map((stat, index) => (
        <Card 
          key={index} 
          className={cn(
            "shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-xl overflow-hidden",
            stat.bgColor,
            stat.borderColor
          )}
        >
          <CardContent className="p-6 flex flex-col justify-between h-full">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className={cn("p-2 rounded-full", stat.bgColor === "bg-green-50 dark:bg-green-900/20" && totalGain >=0 ? "bg-green-100 dark:bg-green-800/30" : stat.bgColor === "bg-red-50 dark:bg-red-900/20" && totalGain < 0 ? "bg-red-100 dark:bg-red-800/30" : stat.bgColor === "bg-blue-50 dark:bg-blue-900/20" ? "bg-blue-100 dark:bg-blue-800/30" : "bg-purple-100 dark:bg-purple-800/30" )}>
                  {stat.icon}
                </div>
                <h3 className={cn("text-sm font-medium", stat.textColor)}>
                  {stat.title}
                </h3>
              </div>
            </div>
            <div>
              <p className={cn("text-3xl font-bold mb-1", stat.valueColor)}>
                ₹{stat.value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
              </p>
              {stat.percent !== undefined && (
                <p className={cn("text-xs", stat.textColor)}>
                  ({stat.percent >= 0 ? '+' : ''}{stat.percent.toFixed(2)}%)
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
