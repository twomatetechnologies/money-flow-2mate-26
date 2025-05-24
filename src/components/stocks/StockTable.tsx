import React from 'react';
import { StockHolding } from '@/types';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Pencil, Trash, History, Inbox } from 'lucide-react';
import FamilyMemberDisplay from '@/components/common/FamilyMemberDisplay';
import SortButton, { SortDirection } from '@/components/common/SortButton';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface StockTableProps {
  stocks: StockHolding[];
  onEdit: (stock: StockHolding) => void;
  onDelete: (stock: StockHolding) => void;
  onViewAudit: (stockId: string) => void;
  onSortChange?: (field: string, direction: SortDirection) => void;
  currentSort?: string | null;
  currentDirection?: SortDirection;
}

interface SortableTableHeaderProps {
  field: string;
  children: React.ReactNode;
  className?: string;
  onSortChange?: (field: string, direction: SortDirection) => void;
  currentSort?: string | null;
  currentDirection?: SortDirection;
}

const SortableTableHeader: React.FC<SortableTableHeaderProps> = ({
  field,
  children,
  className = "",
  onSortChange,
  currentSort,
  currentDirection
}) => {
  if (!onSortChange) {
    return <TableHead className={className}>{children}</TableHead>;
  }
  
  const isActive = currentSort === field;
  
  return (
    <TableHead className={cn(
      className, 
      { "cursor-pointer hover:bg-slate-200/50 dark:hover:bg-slate-700/50": !!onSortChange }
    )}>
      <div className="flex items-center justify-between">
        <span>{children}</span>
        <SortButton
          minimal
          options={[{ label: field, value: field }]}
          currentSort={isActive ? field : null}
          currentDirection={isActive ? currentDirection || null : null}
          onSortChange={(_, direction) => onSortChange(field, direction)}
        />
      </div>
    </TableHead>
  );
};

export const StockTable: React.FC<StockTableProps> = ({
  stocks = [],
  onEdit,
  onDelete,
  onViewAudit,
  onSortChange,
  currentSort,
  currentDirection
}) => {
  const safeStocks = Array.isArray(stocks) ? stocks.filter(Boolean) : [];

  const totalQuantity = safeStocks.reduce((sum, stock) => sum + (stock.quantity || 0), 0);
  const totalCurrentValue = safeStocks.reduce((sum, stock) => sum + (stock.value || 0), 0);
  const totalInvestment = safeStocks.reduce(
    (sum, stock) => sum + ((stock.averageBuyPrice || 0) * (stock.quantity || 0)),
    0
  );
  const overallGain = totalCurrentValue - totalInvestment;
  const overallGainPercent = totalInvestment > 0 ? (overallGain / totalInvestment) * 100 : 0;

  return (
    <Table>
      <TableCaption>Your stock portfolio as of today</TableCaption>
      <TableHeader className="bg-slate-100 dark:bg-slate-800">
        <TableRow>
          <SortableTableHeader
            field="symbol"
            onSortChange={onSortChange}
            currentSort={currentSort}
            currentDirection={currentDirection}
          >
            Symbol
          </SortableTableHeader>
          
          <SortableTableHeader
            field="name"
            onSortChange={onSortChange}
            currentSort={currentSort}
            currentDirection={currentDirection}
          >
            Name
          </SortableTableHeader>
          
          <SortableTableHeader
            field="quantity"
            className="text-right"
            onSortChange={onSortChange}
            currentSort={currentSort}
            currentDirection={currentDirection}
          >
            Quantity
          </SortableTableHeader>
          
          <SortableTableHeader
            field="averageBuyPrice"
            className="text-right"
            onSortChange={onSortChange}
            currentSort={currentSort}
            currentDirection={currentDirection}
          >
            Avg. Buy Price
          </SortableTableHeader>
          
          <SortableTableHeader
            field="currentPrice"
            className="text-right"
            onSortChange={onSortChange}
            currentSort={currentSort}
            currentDirection={currentDirection}
          >
            Current Price
          </SortableTableHeader>
          
          <SortableTableHeader
            field="changePercent"
            className="text-right"
            onSortChange={onSortChange}
            currentSort={currentSort}
            currentDirection={currentDirection}
          >
            Change
          </SortableTableHeader>
          
          <SortableTableHeader
            field="value"
            className="text-right"
            onSortChange={onSortChange}
            currentSort={currentSort}
            currentDirection={currentDirection}
          >
            Value
          </SortableTableHeader>
          
          <SortableTableHeader
            field="gainPercent"
            className="text-right"
            onSortChange={onSortChange}
            currentSort={currentSort}
            currentDirection={currentDirection}
          >
            Gain/Loss
          </SortableTableHeader>
          
          <SortableTableHeader
            field="familyMemberId"
            className="text-right" // Keep text-right for header consistency, display component will handle its own alignment
            onSortChange={onSortChange}
            currentSort={currentSort}
            currentDirection={currentDirection}
          >
            Owner
          </SortableTableHeader>
          
          <TableHead className="text-center">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {safeStocks.length === 0 ? (
          <TableRow>
            <TableCell colSpan={10} className="text-center py-12 text-muted-foreground">
              <div className="flex flex-col items-center justify-center">
                <Inbox className="h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
                <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">No Stocks Available</p>
                <p className="text-sm">There are no stocks matching your current filters or search.</p>
                <p className="text-sm mt-1">Try adjusting your filters or adding new stocks.</p>
              </div>
            </TableCell>
          </TableRow>
        ) : (
          safeStocks.map((stock, index) => {
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
          })
        )}
      </TableBody>
      {safeStocks.length > 0 && (
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
      )}
    </Table>
  );
};
