
import React, { useState } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface UseConfirmProps {
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
}

export const useConfirm = ({
  title = 'Are you sure?',
  description = 'This action cannot be undone.',
  confirmText = 'Confirm',
  cancelText = 'Cancel'
}: UseConfirmProps = {}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [callback, setCallback] = useState<() => void>(() => () => {});

  const onConfirm = () => {
    callback();
    setIsOpen(false);
  };

  const confirm = (cb: () => void) => {
    setCallback(() => cb);
    setIsOpen(true);
  };

  const ConfirmDialog = () => (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{cancelText}</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>{confirmText}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  return {
    confirm,
    ConfirmDialog
  };
};
