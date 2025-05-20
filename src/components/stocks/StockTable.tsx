import React from 'react';
import { StockHolding } from '@/types';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Pencil, Trash, History, ArrowUpDown } from 'lucide-react';
import FamilyMemberDisplay from '@/components/common/FamilyMemberDisplay';
import SortButton, { SortDirection } from '@/components/common/SortButton';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';

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
    <TableHead className={`${className} cursor-pointer`}>
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

  return (
    <Table>
      <TableCaption>Your stock portfolio as of today</TableCaption>
      <TableHeader className="bg-gray-50 dark:bg-gray-900">
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
            className="text-right"
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
            <TableCell colSpan={10} className="text-center py-6 text-muted-foreground">
              No stocks found with the current filters
            </TableCell>
          </TableRow>
        ) : (
          safeStocks.map((stock) => {
            if (!stock) return null;
            
            const currentPrice = stock.currentPrice || 0;
            const averageBuyPrice = stock.averageBuyPrice || 0;
            const quantity = stock.quantity || 0;
            const value = stock.value || 0;
            
            const gain = value - (averageBuyPrice * quantity);
            const gainPercent = averageBuyPrice > 0 ? ((currentPrice - averageBuyPrice) / averageBuyPrice) * 100 : 0;
            const changePercent = stock.changePercent || 0;

            return (
              <TableRow key={stock.id || `stock-${Math.random()}`} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/50 transition-colors">
                <TableCell className="font-semibold">{stock.symbol || 'Unknown'}</TableCell>
                <TableCell>{stock.name || 'Unknown'}</TableCell>
                <TableCell className="text-right">{quantity}</TableCell>
                <TableCell className="text-right">₹{averageBuyPrice.toLocaleString()}</TableCell>
                <TableCell className="text-right">₹{currentPrice.toLocaleString()}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end">
                    {changePercent >= 0 ? (
                      <TrendingUp className="h-4 w-4 mr-1 text-green-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 mr-1 text-red-600" />
                    )}
                    <span className={changePercent >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {changePercent >= 0 ? '+' : ''}{changePercent.toFixed(2)}%
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right font-medium">₹{value.toLocaleString()}</TableCell>
                <TableCell className="text-right">
                  <span className={gain >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {gain >= 0 ? '+' : ''}₹{gain.toLocaleString()} ({gainPercent.toFixed(2)}%)
                  </span>
                </TableCell>
                <TableCell>
                  <FamilyMemberDisplay memberId={stock.familyMemberId || ''} />
                </TableCell>
                <TableCell>
                  <div className="flex justify-center space-x-1">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={() => onEdit(stock)} className="hover:bg-blue-50 hover:text-blue-600">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Edit</TooltipContent>
                      </Tooltip>
                      
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={() => onDelete(stock)} className="hover:bg-red-50 hover:text-red-600">
                            <Trash className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Delete</TooltipContent>
                      </Tooltip>
                      
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={() => onViewAudit(stock.id || '')} className="hover:bg-purple-50 hover:text-purple-600">
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
    </Table>
  );
};
