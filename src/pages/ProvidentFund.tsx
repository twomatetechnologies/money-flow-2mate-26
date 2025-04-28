
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
        <Button onClick={openCreateDialog}>Add Provident Fund</Button>
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
