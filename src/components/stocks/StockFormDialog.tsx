
import React from 'react';
import StockForm from '@/components/stocks/StockForm';
import { StockHolding } from '@/types';

interface StockFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (stockData: Partial<StockHolding>) => Promise<void>;
  initialData?: StockHolding;
  mode: 'create' | 'edit';
}

const StockFormDialog: React.FC<StockFormDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode,
}) => {
  return (
    <StockForm
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={onSubmit}
      initialData={initialData}
      mode={mode}
    />
  );
};

export default StockFormDialog;
