
import React from 'react';
import { format } from 'date-fns';
import { AuditRecord } from '@/types/audit';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface AuditTrailProps {
  records: AuditRecord[];
  entityType: string;
}

const AuditTrail = ({ records, entityType }: AuditTrailProps) => {
  // Sort records by timestamp (most recent first)
  const sortedRecords = [...records].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const getActionColor = (action: string) => {
    switch (action) {
      case 'create':
        return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100';
      case 'update':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100';
      case 'delete':
        return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
    }
  };

  return (
    <div className="border rounded-md p-4">
      <h3 className="font-semibold text-lg mb-4">Audit Trail</h3>
      
      {sortedRecords.length === 0 ? (
        <p className="text-muted-foreground">No audit records available.</p>
      ) : (
        <Table>
          <TableCaption>History of changes to this {entityType}</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Action</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedRecords.map((record) => (
              <TableRow key={record.id}>
                <TableCell>
                  <Badge variant="outline" className={getActionColor(record.action)}>
                    {record.action.charAt(0).toUpperCase() + record.action.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>{format(new Date(record.timestamp), 'dd MMM yyyy, HH:mm')}</TableCell>
                <TableCell>{record.userId}</TableCell>
                <TableCell>
                  <pre className="text-xs whitespace-pre-wrap bg-gray-50 dark:bg-gray-900 rounded p-1 max-h-24 overflow-auto">
                    {JSON.stringify(record.details, null, 2)}
                  </pre>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default AuditTrail;
