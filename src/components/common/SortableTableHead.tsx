
import React from 'react';
import { TableHead } from '@/components/ui/table';
import SortButton, { SortDirection } from '@/components/common/SortButton';
import { cn } from '@/lib/utils';

interface SortableTableHeadProps {
  field: string;
  children: React.ReactNode;
  className?: string;
  onSortChange?: (field: string, direction: SortDirection) => void;
  currentSort?: string | null;
  currentDirection?: SortDirection;
}

const SortableTableHead: React.FC<SortableTableHeadProps> = ({
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
    <TableHead className={cn(
      className, 
      { "cursor-pointer hover:bg-slate-200/50 dark:hover:bg-slate-700/50": !!onSortChange }
    )}>
      <div className="flex items-center justify-between">
        <span>{children}</span>
        <SortButton
          minimal
          options={[{ label: field, value: field }]} // Kept simple, might need more context if options are dynamic
          currentSort={isActive ? field : null}
          currentDirection={isActive ? currentDirection || null : null}
          onSortChange={(_, direction) => onSortChange(field, direction)}
        />
      </div>
    </TableHead>
  );
};

export default SortableTableHead;
