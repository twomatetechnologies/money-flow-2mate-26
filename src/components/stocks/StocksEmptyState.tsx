
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Import, AlertCircle } from 'lucide-react';

interface StocksEmptyStateProps {
  onAddStock: () => void;
  onImportClick: () => void;
}

const StocksEmptyState: React.FC<StocksEmptyStateProps> = ({ onAddStock, onImportClick }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-gray-100 p-3 mb-4 dark:bg-gray-700">
        <AlertCircle className="h-6 w-6 text-gray-400 dark:text-gray-500" />
      </div>
      <h3 className="text-lg font-medium mb-2 text-gray-800 dark:text-gray-200">No Stocks Found</h3>
      <p className="text-muted-foreground max-w-md mb-6">
        Your stock portfolio is empty. Add your first stock or import your portfolio to get started.
      </p>
      <div className="flex gap-2">
        <Button onClick={onAddStock} className="h-8 text-xs">
          <Plus className="mr-1 h-3 w-3" /> Add Stock
        </Button>
        <Button variant="outline" onClick={onImportClick} className="h-8 text-xs">
          <Import className="mr-1 h-3 w-3" /> Import Portfolio
        </Button>
      </div>
    </div>
  );
};

export default StocksEmptyState;
