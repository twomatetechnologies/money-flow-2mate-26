
import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PiggyBank } from 'lucide-react';
import { ProvidentFund } from '@/types';
import { format } from 'date-fns';
import { formatIndianNumber } from '@/lib/utils';
import { handleError } from '@/utils/errorHandler';
import { 
  getProvidentFunds,
  createProvidentFund, 
  updateProvidentFund, 
  deleteProvidentFund 
} from '@/services/providentFundService';
import ProvidentFundForm, { ProvidentFundFormData } from '@/components/providentFund/ProvidentFundForm';
import FamilyMemberDisplay from '@/components/common/FamilyMemberDisplay';
import ImportExportMenu from '@/components/common/ImportExportMenu';
import { v4 as uuidv4 } from 'uuid';

const ProvidentFundPage = () => {
  const [providentFunds, setProvidentFunds] = useState<ProvidentFund[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPF, setSelectedPF] = useState<ProvidentFund | undefined>(undefined);
  const { toast } = useToast();

  const fetchProvidentFunds = async () => {
    setLoading(true);
    try {
      const data = await getProvidentFunds();
      setProvidentFunds(data);
    } catch (error) {
      handleError(error, 'Failed to load provident fund data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProvidentFunds();
  }, []);

  const openCreateDialog = () => {
    setSelectedPF(undefined);
    setIsDialogOpen(true);
  };

  const openEditDialog = (pf: ProvidentFund) => {
    setSelectedPF(pf);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setSelectedPF(undefined);
  };

  const handleSubmit = async (data: ProvidentFundFormData) => {
    try {
      if (selectedPF) {
        // Update existing provident fund
        await updateProvidentFund({
          ...data,
          id: selectedPF.id,
          lastUpdated: new Date()
        });
        toast({
          title: "Success",
          description: "Provident fund updated successfully",
        });
      } else {
        // Create new provident fund
        await createProvidentFund({
          ...data,
          lastUpdated: new Date()
        });
        toast({
          title: "Success",
          description: "New provident fund created successfully",
        });
      }
      closeDialog();
      fetchProvidentFunds();
    } catch (error) {
      handleError(error, selectedPF ? 'Failed to update provident fund' : 'Failed to create provident fund');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this provident fund?')) {
      try {
        await deleteProvidentFund(id);
        toast({
          title: "Success",
          description: "Provident fund deleted successfully",
        });
        fetchProvidentFunds();
      } catch (error) {
        handleError(error, 'Failed to delete provident fund');
      }
    }
  };

  // For export functionality
  const getExportData = (data: ProvidentFund[]) => {
    return data.map(pf => ({
      'Employer Name': pf.employerName,
      'Account Number': pf.accountNumber,
      'Interest Rate': pf.interestRate,
      'Monthly Contribution': pf.monthlyContribution,
      'Employee Contribution': pf.employeeContribution,
      'Employer Contribution': pf.employerContribution,
      'Total Balance': pf.totalBalance,
      'Start Date': format(new Date(pf.startDate), 'yyyy-MM-dd'),
      'Family Member ID': pf.familyMemberId || '',
      'Notes': pf.notes || ''
    }));
  };

  // For sample data in import functionality
  const getSampleData = () => {
    const headers = [
      'Employer Name',
      'Account Number',
      'Interest Rate',
      'Monthly Contribution',
      'Employee Contribution',
      'Employer Contribution',
      'Total Balance',
      'Start Date',
      'Family Member ID',
      'Notes'
    ];
    
    const data = [
      ['ABC Company', 'PF123456789', '8.15', '5000', '100000', '80000', '180000', '2023-01-15', 'member-1', 'Primary PF account'],
      ['XYZ Corporation', 'PF987654321', '8.05', '4500', '75000', '60000', '135000', '2022-05-10', 'member-2', 'Secondary PF account']
    ];
    
    return { headers, data };
  };

  // Validation for imported data
  const validateImportedData = (data: any[]) => {
    if (!Array.isArray(data) || data.length === 0) {
      return { valid: false, message: "No valid data found in the file" };
    }
    
    const requiredFields = ['Employer Name', 'Account Number', 'Monthly Contribution', 'Total Balance'];
    const isValid = data.every(item => 
      requiredFields.every(field => item[field] !== undefined && item[field] !== '')
    );
    
    if (!isValid) {
      return { 
        valid: false, 
        message: "Some records are missing required fields. Required: Employer Name, Account Number, Monthly Contribution, Total Balance" 
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
          const pfData: Omit<ProvidentFund, 'id'> = {
            employerName: item['Employer Name'],
            accountNumber: item['Account Number'],
            interestRate: parseFloat(item['Interest Rate']) || 0,
            monthlyContribution: parseFloat(item['Monthly Contribution']) || 0,
            employeeContribution: parseFloat(item['Employee Contribution']) || 0,
            employerContribution: parseFloat(item['Employer Contribution']) || 0,
            totalBalance: parseFloat(item['Total Balance']) || 0,
            startDate: new Date(item['Start Date']) || new Date(),
            familyMemberId: item['Family Member ID'] || '',
            notes: item['Notes'] || '',
            lastUpdated: new Date()
          };
          
          await createProvidentFund(pfData);
          successCount++;
        } catch (error) {
          errorCount++;
          console.error("Error importing record:", error);
        }
      }
      
      toast({
        title: "Import completed",
        description: `Successfully imported ${successCount} provident funds. ${errorCount > 0 ? `Failed: ${errorCount}` : ''}`
      });
      
      fetchProvidentFunds();
    } catch (error) {
      handleError(error, 'Failed to import provident funds');
    }
  };

  // Calculate totals
  const totalBalance = providentFunds.reduce((sum, pf) => sum + pf.totalBalance, 0);
  const totalMonthlyContribution = providentFunds.reduce((sum, pf) => sum + pf.monthlyContribution, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Provident Fund</h1>
          <p className="text-muted-foreground">
            Manage your provident fund accounts and track your retirement savings
          </p>
        </div>
        <div className="flex space-x-2">
          <ImportExportMenu
            data={providentFunds}
            onImport={handleImport}
            exportFilename="provident_funds"
            getExportData={getExportData}
            getSampleData={getSampleData}
            validateImportedData={validateImportedData}
          />
          <Button onClick={openCreateDialog}>Add Provident Fund</Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total PF Balance
            </CardTitle>
            <PiggyBank className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatIndianNumber(totalBalance)}</div>
            <p className="text-xs text-muted-foreground">
              Combined balance across all PF accounts
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Monthly Contribution
            </CardTitle>
            <PiggyBank className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatIndianNumber(totalMonthlyContribution)}</div>
            <p className="text-xs text-muted-foreground">
              Total monthly contributions across all accounts
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg. Interest Rate
            </CardTitle>
            <PiggyBank className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {providentFunds.length > 0 
                ? (providentFunds.reduce((sum, pf) => sum + pf.interestRate, 0) / providentFunds.length).toFixed(2) 
                : '0.00'}%
            </div>
            <p className="text-xs text-muted-foreground">
              Average interest rate across all accounts
            </p>
          </CardContent>
        </Card>
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <p className="text-lg">Loading provident funds...</p>
        </div>
      ) : (
        <>
          {providentFunds.length > 0 ? (
            <Card>
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employer</TableHead>
                      <TableHead>Account Number</TableHead>
                      <TableHead>Interest Rate</TableHead>
                      <TableHead>Monthly Contribution</TableHead>
                      <TableHead>Total Balance</TableHead>
                      <TableHead>Family Member</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {providentFunds.map((pf) => (
                      <TableRow key={pf.id}>
                        <TableCell className="font-medium">{pf.employerName}</TableCell>
                        <TableCell>{pf.accountNumber}</TableCell>
                        <TableCell>{pf.interestRate.toFixed(2)}%</TableCell>
                        <TableCell>{formatIndianNumber(pf.monthlyContribution)}</TableCell>
                        <TableCell>{formatIndianNumber(pf.totalBalance)}</TableCell>
                        <TableCell>
                          <FamilyMemberDisplay memberId={pf.familyMemberId} />
                        </TableCell>
                        <TableCell>{format(new Date(pf.lastUpdated), 'dd MMM yyyy')}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditDialog(pf)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(pf.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            <Card className="text-center py-8">
              <CardContent>
                <p className="mb-4">No provident funds found. Click the "Add Provident Fund" button to create one.</p>
                <Button onClick={openCreateDialog}>Add Provident Fund</Button>
              </CardContent>
            </Card>
          )}
        </>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedPF ? 'Edit Provident Fund' : 'Add New Provident Fund'}
            </DialogTitle>
          </DialogHeader>
          <ProvidentFundForm
            providentFund={selectedPF}
            onSubmit={handleSubmit}
            onCancel={closeDialog}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProvidentFundPage;
