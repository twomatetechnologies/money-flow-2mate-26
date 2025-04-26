
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { getSavingsAccounts, addSavingsAccount, updateSavingsAccount, deleteSavingsAccount } from '@/services/savingsService';
import { SavingsAccount } from '@/types';
import SavingsAccountForm from '@/components/savings/SavingsAccountForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import FamilyMemberDisplay from '@/components/common/FamilyMemberDisplay';

const SavingsAccounts = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [accounts, setAccounts] = useState<SavingsAccount[]>([]);
  const [editingAccount, setEditingAccount] = useState<SavingsAccount | undefined>();
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const { toast } = useToast();

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      const data = await getSavingsAccounts();
      setAccounts(data);
    } catch (error) {
      console.error('Error loading savings accounts:', error);
      toast({
        title: 'Error',
        description: 'Failed to load savings accounts',
        variant: 'destructive',
      });
    }
  };

  const handleAdd = () => {
    setFormMode('create');
    setEditingAccount(undefined);
    setIsFormOpen(true);
  };

  const handleEdit = (account: SavingsAccount) => {
    setFormMode('edit');
    setEditingAccount(account);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteSavingsAccount(id);
      setAccounts(prevAccounts => prevAccounts.filter(acc => acc.id !== id));
      toast({
        title: 'Success',
        description: 'Savings account deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting savings account:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete savings account',
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = async (data: Partial<SavingsAccount>) => {
    try {
      if (formMode === 'create') {
        const newAccount = await addSavingsAccount(data);
        setAccounts(prev => [...prev, newAccount]);
        toast({
          title: 'Success',
          description: 'Savings account added successfully',
        });
      } else {
        const updatedAccount = await updateSavingsAccount(editingAccount!.id, data);
        setAccounts(prev => prev.map(acc => acc.id === editingAccount!.id ? updatedAccount : acc));
        toast({
          title: 'Success',
          description: 'Savings account updated successfully',
        });
      }
    } catch (error) {
      console.error('Error saving savings account:', error);
      toast({
        title: 'Error',
        description: 'Failed to save savings account',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Savings Accounts</h1>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Add Savings Account
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {accounts.map(account => (
          <Card key={account.id} className="relative">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{account.bankName}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Account No:</span>
                  <span>{account.accountNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type:</span>
                  <span>{account.accountType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Balance:</span>
                  <span>₹{account.balance.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Interest Rate:</span>
                  <span>{account.interestRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Branch:</span>
                  <span>{account.branchName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">IFSC:</span>
                  <span>{account.ifscCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Owner:</span>
                  <FamilyMemberDisplay memberId={account.familyMemberId} />
                </div>
                <div className="flex justify-end space-x-2 mt-4">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(account)}>
                    Edit
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(account.id)}>
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <SavingsAccountForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmit}
        initialData={editingAccount}
        mode={formMode}
      />
    </div>
  );
};

export default SavingsAccounts;
