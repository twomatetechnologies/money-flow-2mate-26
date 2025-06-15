import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import { getFixedDeposits, createFixedDeposit, updateFixedDeposit, deleteFixedDeposit } from '@/services/fixedDepositService';
import { FixedDeposit } from '@/types';
import FixedDepositForm from '@/components/fixedDeposits/FixedDepositForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import FamilyMemberDisplay from '@/components/common/FamilyMemberDisplay';
import { handleError } from '@/utils/errorHandler';
import ImportExportMenu from '@/components/common/ImportExportMenu';
import { formatIndianNumber } from '@/lib/utils';
import { isPostgresEnabled } from '@/services/db/dbConnector';
import { getActiveFamilyMembers } from '@/services/familyService';

// Helper to map between database snake_case and UI camelCase
const mapFieldsForUI = (fd: FixedDeposit) => ({
  ...fd,
  bankName: fd.bank_name,
  accountNumber: fd.account_number,
  interestRate: fd.interest_rate,
  startDate: fd.start_date,
  maturityDate: fd.maturity_date,
  maturityAmount: fd.maturity_amount,
  isAutoRenew: fd.is_auto_renewal,
  familyMemberId: fd.family_member_id
});

// Helper to map from UI camelCase to database snake_case
const mapFieldsForDB = (fd: any) => ({
  ...fd,
  bank_name: fd.bankName,
  account_number: fd.accountNumber,
  interest_rate: fd.interestRate,
  start_date: fd.startDate,
  maturity_date: fd.maturityDate,
  maturity_amount: fd.maturityAmount,
  is_auto_renewal: fd.isAutoRenew,
  family_member_id: fd.familyMemberId
});

const FixedDeposits = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [fixedDeposits, setFixedDeposits] = useState<FixedDeposit[]>([]);
  const [editingFd, setEditingFd] = useState<FixedDeposit | undefined>();
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [familyFilter, setFamilyFilter] = useState<string | undefined>(undefined);

  useEffect(() => {
    // On component mount, store the PostgreSQL status from environment in localStorage
    try {
      // This value would be injected by the server during SSR or through a global window variable
      const postgresEnabled = typeof window.POSTGRES_ENABLED !== 'undefined' 
                             ? window.POSTGRES_ENABLED
                             : process.env.POSTGRES_ENABLED === 'true';
      
      localStorage.setItem('POSTGRES_ENABLED', String(postgresEnabled));
    } catch (error) {
      console.error('Error storing PostgreSQL status:', error);
    }
    
    loadFixedDeposits();
  }, []);

  const loadFixedDeposits = async () => {
    setIsLoading(true);
    try {
      const data = await getFixedDeposits();
      setFixedDeposits(data.map(mapFieldsForUI));
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
      // Convert from UI fields to DB fields
      const dbData = mapFieldsForDB(data);
      
      if (formMode === 'create') {
        const newFd = await createFixedDeposit(dbData);
        setFixedDeposits(prev => [...prev, mapFieldsForUI(newFd)]);
        toast({
          title: 'Success',
          description: 'Fixed deposit added successfully',
        });
      } else if (editingFd) {
        const updatedFd = await updateFixedDeposit(editingFd.id, dbData);
        if (updatedFd) {
          setFixedDeposits(prev => prev.map(fd => fd.id === editingFd.id ? mapFieldsForUI(updatedFd) : fd));
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

  // Filter deposits by family member if a filter is set
  const filteredDeposits = familyFilter 
    ? fixedDeposits.filter(fd => fd.familyMemberId === familyFilter)
    : fixedDeposits;

  // For export functionality
  const getExportData = (data: FixedDeposit[]) => {
    return data.map(fd => ({
      'Bank Name': fd.bankName,
      'Account Number': fd.accountNumber,
      'Principal': fd.principal,
      'Interest Rate': fd.interestRate,
      'Start Date': fd.startDate ? new Date(fd.startDate).toISOString().split('T')[0] : '',
      'Maturity Date': fd.maturityDate ? new Date(fd.maturityDate).toISOString().split('T')[0] : '',
      'Maturity Amount': fd.maturityAmount,
      'Auto Renew': fd.isAutoRenew ? 'Yes' : 'No',
      'Owner ID': fd.familyMemberId || '',
      'Notes': fd.notes || ''
    }));
  };

  // For sample data in import functionality
  const getSampleData = () => {
    const headers = [
      'Bank Name',
      'Account Number',
      'Principal',
      'Interest Rate',
      'Start Date',
      'Maturity Date',
      'Maturity Amount',
      'Auto Renew',
      'Owner ID',
      'Notes'
    ];
    
    const data = [
      [
        'HDFC Bank',
        'FD123456789',
        '100000',
        '7.5',
        '2023-01-15',
        '2024-01-15',
        '107500',
        'Yes',
        'self-default',
        'Emergency fund FD'
      ],
      [
        'SBI',
        'FD987654321',
        '200000',
        '7.0',
        '2023-05-10',
        '2025-05-10',
        '229400',
        'No',
        'spouse-default',
        'Long term saving'
      ]
    ];
    
    return { headers, data };
  };

  // Validation for imported data
  const validateImportedData = (data: any[]) => {
    if (!Array.isArray(data) || data.length === 0) {
      return { valid: false, message: "No valid data found in the file" };
    }
    
    const requiredFields = ['Bank Name', 'Account Number', 'Principal', 'Interest Rate', 'Start Date', 'Maturity Date'];
    const isValid = data.every(item => 
      requiredFields.every(field => item[field] !== undefined && item[field] !== '')
    );
    
    if (!isValid) {
      return { 
        valid: false, 
        message: "Some records are missing required fields. Required: Bank Name, Account Number, Principal, Interest Rate, Start Date, Maturity Date" 
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
          // Create UI object format first
          const uiData: any = {
            bankName: item['Bank Name'],
            accountNumber: item['Account Number'],
            principal: parseFloat(item['Principal']) || 0,
            interestRate: parseFloat(item['Interest Rate']) || 0,
            startDate: new Date(item['Start Date']),
            maturityDate: new Date(item['Maturity Date']),
            maturityAmount: parseFloat(item['Maturity Amount']) || 0,
            isAutoRenew: item['Auto Renew'] === 'Yes' || item['Auto Renew'] === true,
            familyMemberId: item['Owner ID'] || 'self-default', // Using Owner ID field for import
            notes: item['Notes'] || '',
            lastUpdated: new Date()
          };
          
          // Convert to DB format
          const dbData = mapFieldsForDB(uiData);
          
          await createFixedDeposit(dbData);
          successCount++;
        } catch (error) {
          errorCount++;
          console.error("Error importing record:", error);
        }
      }
      
      toast({
        title: "Import completed",
        description: `Successfully imported ${successCount} fixed deposits. ${errorCount > 0 ? `Failed: ${errorCount}` : ''}`
      });
      
      loadFixedDeposits();
    } catch (error) {
      handleError(error, 'Failed to import fixed deposits');
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Fixed Deposits</h1>
          <p className="text-sm text-muted-foreground">
            {isPostgresEnabled() ? 'Using PostgreSQL database' : 'Using local storage'}
          </p>
        </div>
        <div className="flex space-x-2">
          <ImportExportMenu
            data={fixedDeposits}
            onImport={handleImport}
            exportFilename="fixed_deposits"
            getExportData={getExportData}
            getSampleData={getSampleData}
            validateImportedData={validateImportedData}
          />
          <Button onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Add Fixed Deposit
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : fixedDeposits.length === 0 ? (
        <div className="text-center py-10 border rounded-lg bg-muted/20">
          <p className="text-muted-foreground">No fixed deposits found. Click the "Add Fixed Deposit" button to create one.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredDeposits.map(fd => (
            <Card key={fd.id} className="relative">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{fd.bankName}</CardTitle>
                <div className="absolute top-4 right-4">
                  <FamilyMemberDisplay memberId={fd.familyMemberId || 'self-default'} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Account No:</span>
                    <span>{fd.accountNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Principal:</span>
                    <span>{formatIndianNumber(fd.principal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Interest Rate:</span>
                    <span>{fd.interestRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Maturity Amount:</span>
                    <span>{formatIndianNumber(fd.maturityAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Maturity Date:</span>
                    <span>{new Date(fd.maturityDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Owner:</span>
                    <FamilyMemberDisplay memberId={fd.familyMemberId || 'self-default'} />
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
