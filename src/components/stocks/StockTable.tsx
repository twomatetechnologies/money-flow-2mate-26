
import React from 'react';
import { StockHolding } from '@/types';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Pencil, Trash, History } from 'lucide-react';
import FamilyMemberDisplay from '@/components/common/FamilyMemberDisplay';

interface StockTableProps {
  stocks: StockHolding[];
  onEdit: (stock: StockHolding) => void;
  onDelete: (stock: StockHolding) => void;
  onViewAudit: (stockId: string) => void;
}

export const StockTable: React.FC<StockTableProps> = ({
  stocks,
  onEdit,
  onDelete,
  onViewAudit
}) => {
  return (
    <Table>
      <TableCaption>Your stock portfolio as of today</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Symbol</TableHead>
          <TableHead>Name</TableHead>
          <TableHead className="text-right">Quantity</TableHead>
          <TableHead className="text-right">Avg. Buy Price</TableHead>
          <TableHead className="text-right">Current Price</TableHead>
          <TableHead className="text-right">Change</TableHead>
          <TableHead className="text-right">Value</TableHead>
          <TableHead className="text-right">Gain/Loss</TableHead>
          <TableHead>Owner</TableHead>
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
