import React from 'react';
import { StockHolding } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
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

interface StockCardProps {
  stock: StockHolding;
  onEdit: (stock: StockHolding) => void;
  onDelete: (stock: StockHolding) => void;
  onViewAudit: (stockId: string) => void;
}

const StockCard: React.FC<StockCardProps> = ({ stock, onEdit, onDelete, onViewAudit }) => {
  if (!stock) return null;
            
  const currentPrice = stock.currentPrice || 0;
  const averageBuyPrice = stock.averageBuyPrice || 0;
  const quantity = stock.quantity || 0;
  const value = stock.value || 0;
  
  const gain = value - (averageBuyPrice * quantity);
  const gainPercent = averageBuyPrice > 0 ? ((currentPrice - averageBuyPrice) / averageBuyPrice) * 100 : 0;
  const changePercent = stock.changePercent || 0;

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-primary text-lg">{stock.symbol}</h3>
            <p className="text-sm text-muted-foreground truncate">{stock.name || stock.symbol || 'Unknown Company'}</p>
          </div>
          <div className="flex items-center space-x-1">
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
        </div>

        {/* Price Information */}
        <div className="grid grid-cols-2 gap-4 mb-3">
          <div>
            <p className="text-xs text-muted-foreground">Current Price</p>
            <p className="font-semibold">
              ₹{currentPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Buy Price</p>
            <p className="font-medium">
              ₹{averageBuyPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
            </p>
          </div>
        </div>

        {/* Change Percentage */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
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
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Quantity</p>
            <p className="font-medium">{quantity.toLocaleString()}</p>
          </div>
        </div>

        {/* Value and Gain/Loss */}
        <div className="grid grid-cols-2 gap-4 mb-3">
          <div>
            <p className="text-xs text-muted-foreground">Market Value</p>
            <p className="font-semibold">
              ₹{value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">P&L</p>
            <div className="flex flex-col">
              <span className={cn(
                "font-medium text-sm",
                gain >= 0 ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'
              )}>
                {gain >= 0 ? '+' : ''}₹{gain.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
              </span>
              <span className={cn(
                "text-xs",
                gain >= 0 ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'
              )}>
                ({gainPercent.toFixed(2)}%)
              </span>
            </div>
          </div>
        </div>

        {/* Owner */}
        {stock.familyMemberId && (
          <div className="border-t pt-2">
            <p className="text-xs text-muted-foreground mb-1">Owner</p>
            <FamilyMemberDisplay memberId={stock.familyMemberId} />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StockCard;
