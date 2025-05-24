
import React from 'react';
import { StockHolding } from '@/types';
import { Table, TableBody, TableCaption, TableCell, TableHeader, TableRow, TableHead } from '@/components/ui/table';
import { Inbox } from 'lucide-react';
import SortableTableHead from '@/components/common/SortableTableHead';
import StockTableRow from './StockTableRow';
import StockTableFooter from './StockTableFooter';
import { SortDirection } from '@/components/common/SortButton'; // Ensure this is correctly imported if SortableTableHead needs it externally

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
  const safeStocks = Array.isArray(stocks) ? stocks.filter(Boolean) : [];

  return (
    <Table>
      <TableCaption>Your stock portfolio as of today</TableCaption>
      <TableHeader className="bg-slate-100 dark:bg-slate-800">
        <TableRow>
          <SortableTableHead
            field="symbol"
            onSortChange={onSortChange}
            currentSort={currentSort}
            currentDirection={currentDirection}
          >
            Symbol
          </SortableTableHead>
          
          <SortableTableHead
            field="name"
            onSortChange={onSortChange}
            currentSort={currentSort}
            currentDirection={currentDirection}
          >
            Name
          </SortableTableHead>
          
          <SortableTableHead
            field="quantity"
            className="text-right"
            onSortChange={onSortChange}
            currentSort={currentSort}
            currentDirection={currentDirection}
          >
            Quantity
          </SortableTableHead>
          
          <SortableTableHead
            field="averageBuyPrice"
            className="text-right"
            onSortChange={onSortChange}
            currentSort={currentSort}
            currentDirection={currentDirection}
          >
            Avg. Buy Price
          </SortableTableHead>
          
          <SortableTableHead
            field="currentPrice"
            className="text-right"
            onSortChange={onSortChange}
            currentSort={currentSort}
            currentDirection={currentDirection}
          >
            Current Price
          </SortableTableHead>
          
          <SortableTableHead
            field="changePercent"
            className="text-right"
            onSortChange={onSortChange}
            currentSort={currentSort}
            currentDirection={currentDirection}
          >
            Change
          </SortableTableHead>
          
          <SortableTableHead
            field="value"
            className="text-right"
            onSortChange={onSortChange}
            currentSort={currentSort}
            currentDirection={currentDirection}
          >
            Value
          </SortableTableHead>
          
          <SortableTableHead
            field="gainPercent"
            className="text-right"
            onSortChange={onSortChange}
            currentSort={currentSort}
            currentDirection={currentDirection}
          >
            Gain/Loss
          </SortableTableHead>
          
          <SortableTableHead
            field="familyMemberId"
            className="text-right" 
            onSortChange={onSortChange}
            currentSort={currentSort}
            currentDirection={currentDirection}
          >
            Owner
          </SortableTableHead>
          
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
  );
};
