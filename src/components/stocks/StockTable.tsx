
import React, { useState } from 'react';
import { StockHolding } from '@/types';
import { Table, TableBody, TableCaption, TableCell, TableHeader, TableRow, TableHead } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Inbox, Grid, List } from 'lucide-react';
import SortableTableHead from '@/components/common/SortableTableHead';
import StockTableRow from './StockTableRow';
import StockTableFooter from './StockTableFooter';
import StockCard from './StockCard';
import { SortDirection } from '@/components/common/SortButton';

interface StockTableProps {
  stocks: StockHolding[];
  onEdit: (stock: StockHolding) => void;
  onDelete: (stock: StockHolding) => void;
  onViewAudit: (stockId: string) => void;
  onSortChange?: (field: string, direction: SortDirection) => void;
  currentSort?: string | null;
  currentDirection?: SortDirection;
}

export const StockTable: React.FC<StockTableProps> = ({
  stocks = [],
  onEdit,
  onDelete,
  onViewAudit,
  onSortChange,
  currentSort,
  currentDirection
}) => {
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const safeStocks = Array.isArray(stocks) ? stocks.filter(Boolean) : [];

  // Empty state component
  const EmptyState = () => (
    <div className="text-center py-12 text-muted-foreground">
      <div className="flex flex-col items-center justify-center">
        <Inbox className="h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
        <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">No Stocks Available</p>
        <p className="text-sm">There are no stocks matching your current filters or search.</p>
        <p className="text-sm mt-1">Try adjusting your filters or adding new stocks.</p>
      </div>
    </div>
  );

  // View mode toggle
  const ViewModeToggle = () => (
    <div className="flex items-center space-x-2 mb-4">
      <Button
        variant={viewMode === 'table' ? 'default' : 'outline'}
        size="sm"
        onClick={() => setViewMode('table')}
        className="hidden sm:flex"
      >
        <List className="h-4 w-4 mr-2" />
        Table
      </Button>
      <Button
        variant={viewMode === 'cards' ? 'default' : 'outline'}
        size="sm"
        onClick={() => setViewMode('cards')}
      >
        <Grid className="h-4 w-4 mr-2" />
        Cards
      </Button>
    </div>
  );

  if (safeStocks.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-4">
      <ViewModeToggle />
      
      {viewMode === 'cards' ? (
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {safeStocks.map((stock, index) => (
            <StockCard
              key={stock.id || `stock-${index}`}
              stock={stock}
              onEdit={onEdit}
              onDelete={onDelete}
              onViewAudit={onViewAudit}
            />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
        <TableCaption>Your stock portfolio as of today</TableCaption>
        <TableHeader className="bg-slate-100 dark:bg-slate-800">
          <TableRow>
            <SortableTableHead
              field="symbol"
              className="min-w-[80px]"
              onSortChange={onSortChange}
              currentSort={currentSort}
              currentDirection={currentDirection}
            >
              Symbol
            </SortableTableHead>
            
            <SortableTableHead
              field="name"
              className="min-w-[200px]"
              onSortChange={onSortChange}
              currentSort={currentSort}
              currentDirection={currentDirection}
            >
              Company Name
            </SortableTableHead>
            
            <SortableTableHead
              field="quantity"
              className="text-right min-w-[100px]"
              onSortChange={onSortChange}
              currentSort={currentSort}
              currentDirection={currentDirection}
            >
              Qty
            </SortableTableHead>
            
            <SortableTableHead
              field="averageBuyPrice"
              className="text-right min-w-[120px]"
              onSortChange={onSortChange}
              currentSort={currentSort}
              currentDirection={currentDirection}
            >
              Buy Price
            </SortableTableHead>
            
            <SortableTableHead
              field="currentPrice"
              className="text-right min-w-[120px]"
              onSortChange={onSortChange}
              currentSort={currentSort}
              currentDirection={currentDirection}
            >
              Current Price
            </SortableTableHead>
            
            <SortableTableHead
              field="changePercent"
              className="text-right min-w-[100px]"
              onSortChange={onSortChange}
              currentSort={currentSort}
              currentDirection={currentDirection}
            >
              Change %
            </SortableTableHead>
            
            <SortableTableHead
              field="value"
              className="text-right min-w-[120px]"
              onSortChange={onSortChange}
              currentSort={currentSort}
              currentDirection={currentDirection}
            >
              Market Value
            </SortableTableHead>
            
            <SortableTableHead
              field="gainPercent"
              className="text-right min-w-[120px]"
              onSortChange={onSortChange}
              currentSort={currentSort}
              currentDirection={currentDirection}
            >
              P&L
            </SortableTableHead>
            
            <SortableTableHead
              field="familyMemberId"
              className="text-center min-w-[100px]" 
              onSortChange={onSortChange}
              currentSort={currentSort}
              currentDirection={currentDirection}
            >
              Owner
            </SortableTableHead>
            
            <TableHead className="text-center min-w-[120px] sticky right-0 bg-slate-100 dark:bg-slate-800">
              Actions
            </TableHead>
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
          safeStocks.map((stock, index) => (
            <StockTableRow
              key={stock.id || `stock-${index}`}
              stock={stock}
              index={index}
              onEdit={onEdit}
              onDelete={onDelete}
              onViewAudit={onViewAudit}
            />
          ))
        )}
      </TableBody>
      <StockTableFooter stocks={safeStocks} />
    </Table>
        </div>
      )}
    </div>
  );
};
