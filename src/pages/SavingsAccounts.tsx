
import React, { useEffect, useState } from 'react';
import { getSavingsAccounts, createSavingsAccount, updateSavingsAccount, deleteSavingsAccount } from '@/services/savingsService';
import { SavingsAccount } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, Wallet } from 'lucide-react';
import SavingsAccountForm from '@/components/savings/SavingsAccountForm';
import { useToast } from '@/components/ui/use-toast';
import AuditTrail from '@/components/common/AuditTrail';
import { getAuditRecordsByType } from '@/services/auditService';
import FamilyMemberDisplay from '@/components/common/FamilyMemberDisplay';
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";

const SavingsAccounts = () => {
  const [accounts, setAccounts] = useState<SavingsAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selectedAccount, setSelectedAccount] = useState<SavingsAccount | undefined>(undefined);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<string | null>(null);
  const [auditRecords, setAuditRecords] = useState([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchAccounts();
    fetchAuditRecords();
  }, []);

  const fetchAccounts = async () => {
    try {
      const data = await getSavingsAccounts();
      setAccounts(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching savings accounts:', error);
      setLoading(false);
    }
  };

  const fetchAuditRecords = () => {
    try {
      const records = getAuditRecordsByType('savingsAccount');
      setAuditRecords(records);
    } catch (error) {
      console.error('Error fetching audit records:', error);
    }
  };

  const handleCreateAccount = (accountData: Omit<SavingsAccount, 'id' | 'lastUpdated'>) => {
    try {
      const newAccount = createSavingsAccount(accountData);
      setAccounts([...accounts, newAccount]);
      fetchAuditRecords();
      toast({
        title: "Account Created",
        description: "Your savings account has been successfully added.",
      });
    } catch (error) {
      console.error('Error creating savings account:', error);
      toast({
        title: "Error",
        description: "Failed to create savings account.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateAccount = (accountData: Partial<SavingsAccount>) => {
    if (selectedAccount) {
      try {
        const updatedAccount = updateSavingsAccount(selectedAccount.id, accountData);
        if (updatedAccount) {
          setAccounts(accounts.map(acc => acc.id === updatedAccount.id ? updatedAccount : acc));
          fetchAuditRecords();
          toast({
            title: "Account Updated",
            description: "Your savings account has been successfully updated.",
          });
        }
      } catch (error) {
        console.error('Error updating savings account:', error);
        toast({
          title: "Error",
          description: "Failed to update savings account.",
          variant: "destructive",
        });
      }
    }
  };

  const handleDeleteAccount = () => {
    if (accountToDelete) {
      try {
        const success = deleteSavingsAccount(accountToDelete);
        if (success) {
          setAccounts(accounts.filter(acc => acc.id !== accountToDelete));
          fetchAuditRecords();
          toast({
            title: "Account Deleted",
            description: "Your savings account has been successfully deleted.",
          });
        }
      } catch (error) {
        console.error('Error deleting savings account:', error);
        toast({
          title: "Error",
          description: "Failed to delete savings account.",
          variant: "destructive",
        });
      }
      setAccountToDelete(null);
    }
    setIsConfirmOpen(false);
  };

  const openCreateForm = () => {
    setFormMode('create');
    setSelectedAccount(undefined);
    setIsFormOpen(true);
  };

  const openEditForm = (account: SavingsAccount) => {
    setFormMode('edit');
    setSelectedAccount(account);
    setIsFormOpen(true);
  };

  const confirmDelete = (id: string) => {
    setAccountToDelete(id);
    setIsConfirmOpen(true);
  };

  const handleFormSubmit = (account: Partial<SavingsAccount>) => {
    if (formMode === 'create') {
      handleCreateAccount(account as Omit<SavingsAccount, 'id' | 'lastUpdated'>);
    } else {
      handleUpdateAccount(account);
    }
  };

  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-lg">Loading savings accounts data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Savings Accounts</h1>
          <p className="text-muted-foreground">
            Track your savings accounts across different banks
          </p>
        </div>
        <Button onClick={openCreateForm} className="flex items

-center gap-2">
          <Plus className="h-4 w-4" />
          Add Savings Account
        </Button>
      </div>

      <div className="grid gap-6">
        <Card className="finance-card">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Total Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="stat-value">₹{totalBalance.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="finance-card">
          <CardHeader>
            <CardTitle>Your Savings Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableCaption>Your savings accounts across different banks</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Bank</TableHead>
                  <TableHead>Account Number</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead className="text-right">Interest Rate</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>IFSC</TableHead>
                  <TableHead>Account Holder</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accounts.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell className="font-medium">{account.bankName}</TableCell>
                    <TableCell>{account.accountNumber}</TableCell>
                    <TableCell>{account.accountType}</TableCell>
                    <TableCell className="text-right">₹{account.balance.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{account.interestRate}%</TableCell>
                    <TableCell>{account.branchName}</TableCell>
                    <TableCell>{account.ifscCode}</TableCell>
                    <TableCell><FamilyMemberDisplay memberId={account.familyMemberId} /></TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => openEditForm(account)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => confirmDelete(account.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {accounts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-6 text-muted-foreground">
                      No savings accounts found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Audit Trail */}
      <AuditTrail records={auditRecords} entityType="Savings Account" />

      {/* Forms */}
      <SavingsAccountForm 
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedAccount}
        mode={formMode}
      />

      {/* Confirmation Dialog */}
      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the selected savings account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAccount}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SavingsAccounts;
