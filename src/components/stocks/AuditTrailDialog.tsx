
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import AuditTrail from '@/components/common/AuditTrail';
import { AuditRecord } from '@/types/audit';

interface AuditTrailDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  records: AuditRecord[];
}

const AuditTrailDialog: React.FC<AuditTrailDialogProps> = ({
  isOpen,
  onOpenChange,
  records,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Audit Trail</DialogTitle>
          <DialogDescription>
            View the history of changes for this stock
          </DialogDescription>
        </DialogHeader>
        <AuditTrail records={records} entityType="stock" />
      </DialogContent>
    </Dialog>
  );
};

export default AuditTrailDialog;
