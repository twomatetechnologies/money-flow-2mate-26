import React, { useEffect, useState } from 'react';
import { getFixedDeposits, createFixedDeposit, updateFixedDeposit, deleteFixedDeposit } from '@/services/crudService';
import { FixedDeposit } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { format, differenceInDays } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, FileText, Download, Upload } from 'lucide-react';
import FixedDepositForm from '@/components/fixedDeposits/FixedDepositForm';
import { useToast } from '@/components/ui/use-toast';
import AuditTrail from '@/components/common/AuditTrail';
import { getAuditRecordsByType } from '@/services/auditService';
import FamilyMemberDisplay from '@/components/common/FamilyMemberDisplay';
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import SortButton, { SortDirection, SortOption } from '@/components/common/SortButton';
import FilterButton, { FilterOption } from '@/components/common/FilterButton';
import { exportFixedDeposits, downloadFixedDepositSample, importFixedDeposits } from '@/services/fixedDepositService';

const FixedDeposits = () => {
  const [fixedDeposits, setFixedDeposits] = useState<FixedDeposit[]>([]);
  const [displayedDeposits, setDisplayedDeposits] = useState<FixedDeposit[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selectedFD, setSelectedFD] = useState<FixedDeposit | undefined>(undefined);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [fdToDelete, setFdToDelete] = useState<string | null>(null);
  const [auditRecords, setAuditRecords] = useState([]);
  const { toast } = useToast();

  // Sorting state
  const [currentSort, setCurrentSort] = useState<string | null>(null);
  const [currentDirection, setCurrentDirection] = useState<SortDirection>(null);

  // Filtering state
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});

  const sortOptions: SortOption[] = [
    { label: 'Bank Name', value: 'bankName' },
    { label: 'Principal', value: 'principal' },
    { label: 'Interest Rate', value: 'interestRate' },
    { label: 'Maturity Date', value: 'maturityDate' },
    { label: 'Maturity Amount', value: 'maturityAmount' },
  ];

  const filterOptions: FilterOption[] = [
    {
      id: 'bankName',
      label: 'Bank',
      type: 'select',
      options: Array.from(new Set(fixedDeposits.map(fd => fd.bankName)))
        .map(bank => ({ value: bank, label: bank }))
    },
    {
      id: 'maturityStatus',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'active', label: 'Active' },
        { value: 'matured', label: 'Matured' }
      ]
    }
  ];

  useEffect(() => {
    fetchFixedDeposits();
    fetchAuditRecords();
  }, []);

  // Apply sorting and filtering whenever the underlying data or sort/filter options change
  useEffect(() => {
    applyFiltersAndSort();
  }, [fixedDeposits, currentSort, currentDirection, activeFilters]);

  const fetchFixedDeposits = async () => {
    try {
      const data = await getFixedDeposits();
      setFixedDeposits(data);
      setDisplayedDeposits(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching fixed deposits:', error);
      setLoading(false);
    }
  };

  const fetchAuditRecords = () => {
    try {
      const records = getAuditRecordsByType('fixedDeposit');
      setAuditRecords(records);
    } catch (error) {
      console.error('Error fetching audit records:', error);
    }
  };

  const handleCreateFD = (fdData: Partial<FixedDeposit>) => {
    try {
      const newFD = createFixedDeposit(fdData);
      setFixedDeposits([...fixedDeposits, newFD]);
      fetchAuditRecords();
      toast({
        title: "Fixed Deposit Created",
        description: "Your fixed deposit has been successfully added.",
      });
    } catch (error) {
      console.error('Error creating fixed deposit:', error);
      toast({
        title: "Error",
        description: "Failed to create fixed deposit.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateFD = (fdData: Partial<FixedDeposit>) => {
    if (selectedFD) {
      try {
        const updatedFD = updateFixedDeposit(selectedFD.id, fdData);
        if (updatedFD) {
          setFixedDeposits(fixedDeposits.map(fd => fd.id === updatedFD.id ? updatedFD : fd));
          fetchAuditRecords();
          toast({
            title: "Fixed Deposit Updated",
            description: "Your fixed deposit has been successfully updated.",
          });
        }
      } catch (error) {
        console.error('Error updating fixed deposit:', error);
        toast({
          title: "Error",
          description: "Failed to update fixed deposit.",
          variant: "destructive",
        });
      }
    }
  };

  const handleDeleteFD = () => {
    if (fdToDelete) {
      try {
        const success = deleteFixedDeposit(fdToDelete);
        if (success) {
          setFixedDeposits(fixedDeposits.filter(fd => fd.id !== fdToDelete));
          fetchAuditRecords();
          toast({
            title: "Fixed Deposit Deleted",
            description: "Your fixed deposit has been successfully deleted.",
          });
        }
      } catch (error) {
        console.error('Error deleting fixed deposit:', error);
        toast({
          title: "Error",
          description: "Failed to delete fixed deposit.",
          variant: "destructive",
        });
      }
      setFdToDelete(null);
    }
    setIsConfirmOpen(false);
  };

  const openCreateForm = () => {
    setFormMode('create');
    setSelectedFD(undefined);
    setIsFormOpen(true);
  };

  const openEditForm = (fd: FixedDeposit) => {
    setFormMode('edit');
    setSelectedFD(fd);
    setIsFormOpen(true);
  };

  const confirmDelete = (id: string) => {
    setFdToDelete(id);
    setIsConfirmOpen(true);
  };

  const handleFormSubmit = (fd: Partial<FixedDeposit>) => {
    if (formMode === 'create') {
      handleCreateFD(fd);
    } else {
      handleUpdateFD(fd);
    }
  };

  const handleSortChange = (sortKey: string, direction: SortDirection) => {
    setCurrentSort(direction ? sortKey : null);
    setCurrentDirection(direction);
  };

  const handleFilterChange = (filterId: string, value: any) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterId]: value
    }));
  };

  const handleClearFilters = () => {
    setActiveFilters({});
  };

  // Function to apply both sorting and filtering
  const applyFiltersAndSort = () => {
    let result = [...fixedDeposits];
    
    // Apply filters
    if (Object.keys(activeFilters).length > 0) {
      Object.entries(activeFilters).forEach(([key, value]) => {
        if (value) {
          if (key === 'bankName') {
            result = result.filter(fd => fd.bankName === value);
          } else if (key === 'maturityStatus') {
            const today = new Date();
            if (value === 'matured') {
              result = result.filter(fd => new Date(fd.maturityDate) <= today);
            } else if (value === 'active') {
              result = result.filter(fd => new Date(fd.maturityDate) > today);
            }
          }
        }
      });
    }
    
    // Apply sorting
    if (currentSort && currentDirection) {
      result.sort((a, b) => {
        let aValue = a[currentSort as keyof FixedDeposit];
        let bValue = b[currentSort as keyof FixedDeposit];
        
        // Handle date comparisons
        if (currentSort === 'startDate' || currentSort === 'maturityDate') {
          aValue = new Date(aValue as string).getTime();
          bValue = new Date(bValue as string).getTime();
        }
        
        if (aValue < bValue) return currentDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return currentDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }
    
    setDisplayedDeposits(result);
  };

  const totalPrincipal = displayedDeposits.reduce((sum, fd) => sum + fd.principal, 0);
  const totalMaturityAmount = displayedDeposits.reduce((sum, fd) => sum + fd.maturityAmount, 0);
  const totalInterest = totalMaturityAmount - totalPrincipal;

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      await importFixedDeposits(file);
      fetchFixedDeposits();
      fetchAuditRecords();
      toast({
        title: "Import Successful",
        description: "Fixed deposits have been imported successfully.",
      });
    } catch (error) {
      console.error('Error importing fixed deposits:', error);
      toast({
        title: "Import Failed",
        description: "Failed to import fixed deposits. Please check the file format.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-lg">Loading fixed deposits data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fixed Deposits</h1>
          <p className="text-muted-foreground">
            Track your fixed deposits across different banks
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => downloadFixedDepositSample()}>
            <FileText className="h-4 w-4 mr-2" />
            Sample File
          </Button>
          <div className="relative">
            <input
              type="file"
              id="fd-file-upload"
              className="hidden"
              accept=".csv,.xlsx,.xls"
              onChange={handleImportFile}
            />
            <Button variant="outline" onClick={() => document.getElementById('fd-file-upload')?.click()}>
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
          </div>
          <Button variant="outline" onClick={() => exportFixedDeposits()}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={openCreateForm} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Fixed Deposit
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="finance-card">
          <CardHeader className="pb-2">
            <CardTitle>Total Principal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="stat-value">₹{totalPrincipal.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card className="finance-card">
          <CardHeader className="pb-2">
            <CardTitle>Total Interest</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="stat-value">₹{totalInterest.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card className="finance-card">
          <CardHeader className="pb-2">
            <CardTitle>Maturity Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="stat-value">₹{totalMaturityAmount.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="finance-card">
        <CardHeader>
          <CardTitle>Your Fixed Deposits</CardTitle>
          <div className="flex items-center gap-2 mt-2">
            <FilterButton 
              options={filterOptions} 
              activeFilters={activeFilters}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
            />
            <SortButton 
              options={sortOptions}
              currentSort={currentSort}
              currentDirection={currentDirection}
              onSortChange={handleSortChange}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableCaption>Your fixed deposits across different banks</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Bank</TableHead>
                <TableHead>Account Number</TableHead>
                <TableHead className="text-right">Principal</TableHead>
                <TableHead className="text-right">Interest Rate</TableHead>
                <TableHead className="text-right">Start Date</TableHead>
                <TableHead className="text-right">Maturity Date</TableHead>
                <TableHead className="text-right">Days Left</TableHead>
                <TableHead className="text-right">Maturity Amount</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedDeposits.map((fd) => {
                const daysLeft = differenceInDays(new Date(fd.maturityDate), new Date());
                
                return (
                  <TableRow key={fd.id}>
                    <TableCell className="font-medium">{fd.bankName}</TableCell>
                    <TableCell>{fd.accountNumber}</TableCell>
                    <TableCell className="text-right">₹{fd.principal.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{fd.interestRate}%</TableCell>
                    <TableCell className="text-right">{format(new Date(fd.startDate), 'dd MMM yyyy')}</TableCell>
                    <TableCell className="text-right">{format(new Date(fd.maturityDate), 'dd MMM yyyy')}</TableCell>
                    <TableCell className="text-right">{daysLeft > 0 ? daysLeft : 'Matured'}</TableCell>
                    <TableCell className="text-right">₹{fd.maturityAmount.toLocaleString()}</TableCell>
                    <TableCell><FamilyMemberDisplay memberId={fd.familyMemberId} /></TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => openEditForm(fd)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => confirmDelete(fd.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {displayedDeposits.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-6 text-muted-foreground">
                    No fixed deposits found with the current filters
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Audit Trail */}
      <AuditTrail records={auditRecords} entityType="Fixed Deposit" />

      {/* Forms */}
      <FixedDepositForm 
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedFD}
        mode={formMode}
      />

      {/* Confirmation Dialog */}
      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the selected fixed deposit.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteFD}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default FixedDeposits;
