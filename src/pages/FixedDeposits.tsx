
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { getFixedDeposits, addFixedDeposit, updateFixedDeposit, deleteFixedDeposit } from '@/services/fixedDepositService';
import { FixedDeposit } from '@/types';
import FixedDepositForm from '@/components/fixedDeposits/FixedDepositForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import FamilyMemberDisplay from '@/components/common/FamilyMemberDisplay';
import { handleError } from '@/utils/errorHandler';

const FixedDeposits = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [fixedDeposits, setFixedDeposits] = useState<FixedDeposit[]>([]);
  const [editingFd, setEditingFd] = useState<FixedDeposit | undefined>();
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFixedDeposits();
  }, []);

  const loadFixedDeposits = async () => {
    setIsLoading(true);
    try {
      const data = await getFixedDeposits();
      setFixedDeposits(data);
    } catch (error) {
      handleError(error, 'Failed to load fixed deposits');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = () => {
    setFormMode('create');
    setEditingFd(undefined);
    setIsFormOpen(true);
  };

  const handleEdit = (fd: FixedDeposit) => {
    setFormMode('edit');
    setEditingFd(fd);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const success = await deleteFixedDeposit(id);
      if (success) {
        setFixedDeposits(prevFds => prevFds.filter(fd => fd.id !== id));
        toast({
          title: 'Success',
          description: 'Fixed deposit deleted successfully',
        });
      }
    } catch (error) {
      handleError(error, 'Failed to delete fixed deposit');
    }
  };

  const handleSubmit = async (data: Partial<FixedDeposit>) => {
    try {
      if (formMode === 'create') {
        const newFd = await addFixedDeposit(data);
        setFixedDeposits(prev => [...prev, newFd]);
        toast({
          title: 'Success',
          description: 'Fixed deposit added successfully',
        });
      } else if (editingFd) {
        const updatedFd = await updateFixedDeposit(editingFd.id, data);
        if (updatedFd) {
          setFixedDeposits(prev => prev.map(fd => fd.id === editingFd.id ? updatedFd : fd));
          toast({
            title: 'Success',
            description: 'Fixed deposit updated successfully',
          });
        }
      }
      setIsFormOpen(false);
    } catch (error) {
      handleError(error, 'Failed to save fixed deposit');
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Fixed Deposits</h1>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Add Fixed Deposit
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <p>Loading fixed deposits...</p>
        </div>
      ) : fixedDeposits.length === 0 ? (
        <div className="text-center py-10 border rounded-lg bg-muted/20">
          <p className="text-muted-foreground">No fixed deposits found. Click the "Add Fixed Deposit" button to create one.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {fixedDeposits.map(fd => (
            <Card key={fd.id} className="relative">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{fd.bankName}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Account No:</span>
                    <span>{fd.accountNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Principal:</span>
                    <span>₹{fd.principal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Interest Rate:</span>
                    <span>{fd.interestRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Maturity Amount:</span>
                    <span>₹{fd.maturityAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Maturity Date:</span>
                    <span>{new Date(fd.maturityDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Owner:</span>
                    <FamilyMemberDisplay memberId={fd.familyMemberId} />
                  </div>
                  <div className="flex justify-end space-x-2 mt-4">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(fd)}>
                      Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(fd.id)}>
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <FixedDepositForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmit}
        initialData={editingFd}
        mode={formMode}
      />
    </div>
  );
};

export default FixedDeposits;
