
import React from 'react';
import { StockHolding } from '@/types';
import { TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Pencil, Trash, History } from 'lucide-react';
import FamilyMemberDisplay from '@/components/common/FamilyMemberDisplay';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface StockTableRowProps {
  stock: StockHolding;
  index: number;
  onEdit: (stock: StockHolding) => void;
  onDelete: (stock: StockHolding) => void;
  onViewAudit: (stockId: string) => void;
}

const StockTableRow: React.FC<StockTableRowProps> = ({ stock, index, onEdit, onDelete, onViewAudit }) => {
  if (!stock) return null;
            
  const currentPrice = stock.currentPrice || 0;
  const averageBuyPrice = stock.averageBuyPrice || 0;
  const quantity = stock.quantity || 0;
  const value = stock.value || 0;
  
  const gain = value - (averageBuyPrice * quantity);
  const gainPercent = averageBuyPrice > 0 ? ((currentPrice - averageBuyPrice) / averageBuyPrice) * 100 : 0;
  const changePercent = stock.changePercent || 0;

  return (
    <TableRow 
      key={stock.id || `stock-${index}`}
      className={cn(
        index % 2 === 0 ? "bg-white dark:bg-slate-900" : "bg-slate-50 dark:bg-slate-800/70"
      )}
    >
      <TableCell className="font-semibold text-primary">{stock.symbol || 'Unknown'}</TableCell>
      <TableCell>{stock.name || 'Unknown'}</TableCell>
      <TableCell className="text-right">{quantity.toLocaleString()}</TableCell>
      <TableCell className="text-right">₹{averageBuyPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
      <TableCell className="text-right">₹{currentPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end">
          {changePercent >= 0 ? (
            <TrendingUp className="h-4 w-4 mr-1 text-green-600 dark:text-green-500" />
          ) : (
            <TrendingDown className="h-4 w-4 mr-1 text-red-600 dark:text-red-500" />
          )}
          <span className={cn(
            "font-medium",
            changePercent >= 0 ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'
          )}>
            {changePercent >= 0 ? '+' : ''}{changePercent.toFixed(2)}%
          </span>
        </div>
      </TableCell>
      <TableCell className="text-right font-semibold text-slate-700 dark:text-slate-200">₹{value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
      <TableCell className="text-right">
        <span className={cn(
          "font-medium",
          gain >= 0 ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'
        )}>
          {gain >= 0 ? '+' : ''}₹{gain.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} ({gainPercent.toFixed(2)}%)
        </span>
      </TableCell>
      <TableCell className="text-left">
        <FamilyMemberDisplay memberId={stock.familyMemberId || ''} />
      </TableCell>
      <TableCell>
        <div className="flex justify-center space-x-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => onEdit(stock)} className="hover:bg-blue-100/50 dark:hover:bg-blue-800/30 hover:text-blue-600 dark:hover:text-blue-400">
                  <Pencil className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Edit</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => onDelete(stock)} className="hover:bg-red-100/50 dark:hover:bg-red-800/30 hover:text-red-600 dark:hover:text-red-400">
                  <Trash className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => onViewAudit(stock.id || '')} className="hover:bg-purple-100/50 dark:hover:bg-purple-800/30 hover:text-purple-600 dark:hover:text-purple-400">
                  <History className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>View History</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default StockTableRow;
