
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Import } from 'lucide-react';

interface StocksPageHeaderProps {
  onAddStock: () => void;
  onImportClick: () => void;
}

const StocksPageHeader: React.FC<StocksPageHeaderProps> = ({ onAddStock, onImportClick }) => {
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800 mb-2">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">Stock Portfolio</h1>
        <p className="text-sm text-muted-foreground">
          Manage and track your stock investments
        </p>
      </div>
      <div className="flex space-x-2">
        <Button variant="outline" size="sm" onClick={onImportClick} className="h-8 text-xs">
          <Import className="mr-1 h-3 w-3" /> Import
        </Button>
        <Button size="sm" onClick={onAddStock} className="h-8 text-xs bg-primary hover:bg-primary/90">
          <Plus className="mr-1 h-3 w-3" /> Add Stock
        </Button>
      </div>
    </div>
  );
};

export default StocksPageHeader;
