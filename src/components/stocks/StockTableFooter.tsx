
import React from 'react';
import { TableCell, TableRow, TableFooter } from '@/components/ui/table';
import { StockHolding } from '@/types';
import { cn } from '@/lib/utils';

interface StockTableFooterProps {
  stocks: StockHolding[];
}

const StockTableFooter: React.FC<StockTableFooterProps> = ({ stocks }) => {
  const safeStocks = Array.isArray(stocks) ? stocks.filter(Boolean) : [];

  if (safeStocks.length === 0) {
    return null;
  }

  const totalQuantity = safeStocks.reduce((sum, stock) => sum + (stock.quantity || 0), 0);
  const totalCurrentValue = safeStocks.reduce((sum, stock) => sum + (stock.value || 0), 0);
  const totalInvestment = safeStocks.reduce(
    (sum, stock) => sum + ((stock.averageBuyPrice || 0) * (stock.quantity || 0)),
    0
  );
  const overallGain = totalCurrentValue - totalInvestment;
  const overallGainPercent = totalInvestment > 0 ? (overallGain / totalInvestment) * 100 : 0;

  return (
    <TableFooter className="bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700">
      <TableRow>
        <TableCell className="font-semibold">Totals</TableCell>
        <TableCell className="text-right font-semibold">{safeStocks.length.toLocaleString()} stock(s)</TableCell>
        <TableCell className="text-right font-semibold">{totalQuantity.toLocaleString()}</TableCell>
        <TableCell className="text-center text-muted-foreground" colSpan={2}>-</TableCell> 
        <TableCell className="text-center text-muted-foreground">-</TableCell>
        <TableCell className="text-right font-semibold">
          ₹{totalCurrentValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
        </TableCell>
        <TableCell className="text-right font-semibold">
          <span className={cn(overallGain >= 0 ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500')}>
            {overallGain >= 0 ? '+' : ''}₹{overallGain.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} ({overallGainPercent.toFixed(2)}%)
          </span>
        </TableCell>
        <TableCell className="text-center text-muted-foreground" colSpan={2}>-</TableCell>
      </TableRow>
    </TableFooter>
  );
};

export default StockTableFooter;
