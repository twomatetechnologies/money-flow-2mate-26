
import React from 'react';
import { StockHolding } from '@/types';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Pencil, Trash, History, ArrowUpDown } from 'lucide-react';
import FamilyMemberDisplay from '@/components/common/FamilyMemberDisplay';
import SortButton, { SortDirection } from '@/components/common/SortButton';

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
  stocks,
  onEdit,
  onDelete,
  onViewAudit,
  onSortChange,
  currentSort,
  currentDirection
}) => {
  return (
    <Table>
      <TableCaption>Your stock portfolio as of today</TableCaption>
      <TableHeader>
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
        {stocks.length === 0 ? (
          <TableRow>
            <TableCell colSpan={10} className="text-center py-6 text-muted-foreground">
              No stocks found with the current filters
            </TableCell>
          </TableRow>
        ) : (
          stocks.map((stock) => {
            const gain = (stock.currentPrice - stock.averageBuyPrice) * stock.quantity;
            const gainPercent = (gain / (stock.averageBuyPrice * stock.quantity)) * 100;
            
            return (
              <TableRow key={stock.id}>
                <TableCell className="font-medium">{stock.symbol}</TableCell>
                <TableCell>{stock.name}</TableCell>
                <TableCell className="text-right">{stock.quantity}</TableCell>
                <TableCell className="text-right">₹{stock.averageBuyPrice.toLocaleString()}</TableCell>
                <TableCell className="text-right">₹{stock.currentPrice.toLocaleString()}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end">
                    {stock.changePercent >= 0 ? (
                      <TrendingUp className="h-4 w-4 mr-1 trend-up" />
                    ) : (
                      <TrendingDown className="h-4 w-4 mr-1 trend-down" />
                    )}
                    <span className={stock.changePercent >= 0 ? 'trend-up' : 'trend-down'}>
                      {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right">₹{stock.value.toLocaleString()}</TableCell>
                <TableCell className="text-right">
                  <span className={gain >= 0 ? 'trend-up' : 'trend-down'}>
                    {gain >= 0 ? '+' : ''}₹{gain.toLocaleString()} ({gainPercent.toFixed(2)}%)
                  </span>
                </TableCell>
                <TableCell><FamilyMemberDisplay memberId={stock.familyMemberId} /></TableCell>
                <TableCell>
                  <div className="flex justify-center space-x-2">
                    <Button variant="outline" size="icon" onClick={() => onEdit(stock)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => onDelete(stock)}>
                      <Trash className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => onViewAudit(stock.id)}>
                      <History className="h-4 w-4" />
                    </Button>
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
