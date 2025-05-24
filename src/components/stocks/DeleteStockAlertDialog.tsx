
import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { StockHolding } from '@/types';

interface DeleteStockAlertDialogProps {
  stockToDelete: StockHolding | null;
  onOpenChange: (open: boolean) => void;
  onConfirmDelete: () => Promise<void>;
}

const DeleteStockAlertDialog: React.FC<DeleteStockAlertDialogProps> = ({
  stockToDelete,
  onOpenChange,
  onConfirmDelete,
}) => {
  return (
    <AlertDialog
      open={!!stockToDelete}
      onOpenChange={onOpenChange}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will delete {stockToDelete?.name} ({stockToDelete?.symbol}) from your portfolio. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirmDelete}>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteStockAlertDialog;
