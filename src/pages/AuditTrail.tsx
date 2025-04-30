
import React, { useState, useEffect } from 'react';
import { getAllAuditRecords } from '@/services/auditService';
import { AuditRecord } from '@/types/audit';
import { format } from 'date-fns';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Layers } from 'lucide-react';

const AuditTrail = () => {
  const [records, setRecords] = useState<AuditRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<AuditRecord[]>([]);
  const [entityTypeFilter, setEntityTypeFilter] = useState<string>('all');
  const [actionFilter, setActionFilter] = useState<string>('all');
  
  useEffect(() => {
    const fetchRecords = async () => {
      const auditRecords = await getAllAuditRecords();
      // Sort by timestamp (newest first)
      const sortedRecords = auditRecords.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      setRecords(sortedRecords);
      setFilteredRecords(sortedRecords);
    };
    
    fetchRecords();
  }, []);
  
  useEffect(() => {
    let filtered = [...records];
    
    if (entityTypeFilter !== 'all') {
      filtered = filtered.filter(record => record.entityType === entityTypeFilter);
    }
    
    if (actionFilter !== 'all') {
      filtered = filtered.filter(record => record.action === actionFilter);
    }
    
    setFilteredRecords(filtered);
  }, [entityTypeFilter, actionFilter, records]);
  
  const getUniqueEntityTypes = () => {
    const entityTypes = records.map(record => record.entityType);
    return ['all', ...new Set(entityTypes)];
  };
  
  const getActionColor = (action: string) => {
    switch (action) {
      case 'create':
        return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100';
      case 'update':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100';
      case 'delete':
        return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100';
      case 'import':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
    }
  };
  
  const formatEntityType = (type: string) => {
    // Convert camelCase to Title Case with spaces
    return type
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase());
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-2">
        <Layers className="h-6 w-6" />
        <h1 className="text-3xl font-bold">Audit Logs</h1>
      </div>
      
      <div className="flex flex-wrap gap-4">
        <Card className="w-full lg:w-[calc(50%-0.5rem)]">
          <CardHeader>
            <CardTitle>Audit Log Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="bg-background rounded-lg p-3 border">
                <div className="text-sm text-muted-foreground">Total Records</div>
                <div className="text-2xl font-bold">{records.length}</div>
              </div>
              <div className="bg-background rounded-lg p-3 border">
                <div className="text-sm text-muted-foreground">Create Actions</div>
                <div className="text-2xl font-bold">{records.filter(r => r.action === 'create').length}</div>
              </div>
              <div className="bg-background rounded-lg p-3 border">
                <div className="text-sm text-muted-foreground">Update Actions</div>
                <div className="text-2xl font-bold">{records.filter(r => r.action === 'update').length}</div>
              </div>
              <div className="bg-background rounded-lg p-3 border">
                <div className="text-sm text-muted-foreground">Delete Actions</div>
                <div className="text-2xl font-bold">{records.filter(r => r.action === 'delete').length}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex flex-wrap gap-4 items-center">
        <div className="w-64">
          <label className="text-sm font-medium block mb-1">Filter by Type</label>
          <Select value={entityTypeFilter} onValueChange={setEntityTypeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Select entity type" />
            </SelectTrigger>
            <SelectContent>
              {getUniqueEntityTypes().map(type => (
                <SelectItem key={type} value={type}>
                  {type === 'all' ? 'All Types' : formatEntityType(type)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="w-64">
          <label className="text-sm font-medium block mb-1">Filter by Action</label>
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Select action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="create">Create</SelectItem>
              <SelectItem value="update">Update</SelectItem>
              <SelectItem value="delete">Delete</SelectItem>
              <SelectItem value="import">Import</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Card>
        <CardContent className="p-6">
          <Table>
            <TableCaption>A complete history of all data changes in the application</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Action</TableHead>
                <TableHead>Entity Type</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>User</TableHead>
                <TableHead className="hidden md:table-cell">Entity ID</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>
                    <Badge variant="outline" className={getActionColor(record.action)}>
                      {record.action.charAt(0).toUpperCase() + record.action.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatEntityType(record.entityType)}</TableCell>
                  <TableCell>{format(new Date(record.timestamp), 'dd MMM yyyy, HH:mm')}</TableCell>
                  <TableCell>{record.userId}</TableCell>
                  <TableCell className="font-mono text-xs hidden md:table-cell">{record.entityId.substring(0, 8)}...</TableCell>
                  <TableCell>
                    <details className="cursor-pointer">
                      <summary className="text-sm text-blue-600 hover:text-blue-800">
                        View Details
                      </summary>
                      <pre className="text-xs whitespace-pre-wrap bg-gray-50 dark:bg-gray-900 rounded p-2 mt-2 max-h-48 overflow-auto">
                        {JSON.stringify(record.details, null, 2)}
                      </pre>
                    </details>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditTrail;
