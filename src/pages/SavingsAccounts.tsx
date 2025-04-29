
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { getSavingsAccounts, addSavingsAccount, updateSavingsAccount, deleteSavingsAccount } from '@/services/savingsService';
import { SavingsAccount } from '@/types';
import SavingsAccountForm from '@/components/savings/SavingsAccountForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import FamilyMemberDisplay from '@/components/common/FamilyMemberDisplay';
import ImportExportMenu from '@/components/common/ImportExportMenu';
import { v4 as uuidv4 } from 'uuid';

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

  // For export functionality
  const getExportData = (data: SavingsAccount[]) => {
    return data.map(account => ({
      'Bank Name': account.bankName,
      'Account Number': account.accountNumber,
      'Account Type': account.accountType,
      'Balance': account.balance,
      'Interest Rate': account.interestRate,
      'Branch Name': account.branchName,
      'IFSC Code': account.ifscCode,
      'Family Member ID': account.familyMemberId || '',
      'Notes': account.notes || '',
      'Last Updated': new Date(account.lastUpdated).toISOString().split('T')[0]
    }));
  };

  // For sample data in import functionality
  const getSampleData = () => {
    const headers = [
      'Bank Name',
      'Account Number',
      'Account Type',
      'Balance',
      'Interest Rate',
      'Branch Name',
      'IFSC Code',
      'Family Member ID',
      'Notes'
    ];
    
    const data = [
      ['HDFC Bank', 'XXXX1234', 'Savings', '50000', '4.0', 'Main Branch', 'HDFC0001234', 'member-1', 'Primary savings account'],
      ['SBI', 'XXXX5678', 'Salary', '75000', '3.5', 'City Branch', 'SBIN0005678', 'member-2', 'Salary account']
    ];
    
    return { headers, data };
  };

  // Validation for imported data
  const validateImportedData = (data: any[]) => {
    if (!Array.isArray(data) || data.length === 0) {
      return { valid: false, message: "No valid data found in the file" };
    }
    
    const requiredFields = ['Bank Name', 'Account Number', 'Account Type', 'Balance'];
    const isValid = data.every(item => 
      requiredFields.every(field => item[field] !== undefined && item[field] !== '')
    );
    
    if (!isValid) {
      return { 
        valid: false, 
        message: "Some records are missing required fields. Required: Bank Name, Account Number, Account Type, Balance" 
      };
    }
    
    return { valid: true };
  };

  // Handle import functionality
  const handleImport = async (importedData: any[]) => {
    try {
      let successCount = 0;
      let errorCount = 0;
      
      for (const item of importedData) {
        try {
          const accountData: Partial<SavingsAccount> = {
            bankName: item['Bank Name'],
            accountNumber: item['Account Number'],
            accountType: item['Account Type'] as SavingsAccount['accountType'],
            balance: parseFloat(item['Balance']) || 0,
            interestRate: parseFloat(item['Interest Rate']) || 0,
            branchName: item['Branch Name'] || '',
            ifscCode: item['IFSC Code'] || '',
            familyMemberId: item['Family Member ID'] || '',
            notes: item['Notes'] || '',
            lastUpdated: new Date()
          };
          
          await addSavingsAccount(accountData);
          successCount++;
        } catch (error) {
          errorCount++;
          console.error("Error importing record:", error);
        }
      }
      
      toast({
        title: "Import completed",
        description: `Successfully imported ${successCount} accounts. ${errorCount > 0 ? `Failed: ${errorCount}` : ''}`
      });
      
      loadAccounts();
    } catch (error) {
      console.error('Error importing accounts:', error);
      toast({
        title: 'Error',
        description: 'Failed to import savings accounts',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Savings Accounts</h1>
        <div className="flex space-x-2">
          <ImportExportMenu
            data={accounts}
            onImport={handleImport}
            exportFilename="savings_accounts"
            getExportData={getExportData}
            getSampleData={getSampleData}
            validateImportedData={validateImportedData}
          />
          <Button onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Add Savings Account
          </Button>
        </div>
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
