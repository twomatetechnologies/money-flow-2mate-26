
import React from 'react';
import StockImport from '@/components/stocks/StockImport';
import { StockHolding } from '@/types';

interface StockImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (stocksToImport: Partial<StockHolding>[]) => Promise<void>;
}

const StockImportDialog: React.FC<StockImportDialogProps> = ({
  isOpen,
  onClose,
  onImport,
}) => {
  return (
    <StockImport
      isOpen={isOpen}
      onClose={onClose}
      onImport={onImport}
    />
  );
};

export default StockImportDialog;
