
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
import { Plus, Pencil, Trash2 } from 'lucide-react';
import FixedDepositForm from '@/components/fixedDeposits/FixedDepositForm';
import { useToast } from '@/components/ui/use-toast';
import AuditTrail from '@/components/common/AuditTrail';
import { getAuditRecordsByType } from '@/services/auditService';
import { useConfirm } from '@/hooks/useConfirm';
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";

const FixedDeposits = () => {
  const [fixedDeposits, setFixedDeposits] = useState<FixedDeposit[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selectedFD, setSelectedFD] = useState<FixedDeposit | undefined>(undefined);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [fdToDelete, setFdToDelete] = useState<string | null>(null);
  const [auditRecords, setAuditRecords] = useState([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchFixedDeposits();
    fetchAuditRecords();
  }, []);

  const fetchFixedDeposits = async () => {
    try {
      const data = await getFixedDeposits();
      setFixedDeposits(data);
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

  const totalPrincipal = fixedDeposits.reduce((sum, fd) => sum + fd.principal, 0);
  const totalMaturityAmount = fixedDeposits.reduce((sum, fd) => sum + fd.maturityAmount, 0);
  const totalInterest = totalMaturityAmount - totalPrincipal;

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
        <Button onClick={openCreateForm} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Fixed Deposit
        </Button>
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
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fixedDeposits.map((fd) => {
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
