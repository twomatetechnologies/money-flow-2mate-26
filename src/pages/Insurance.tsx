
import React, { useEffect, useState } from 'react';
import { getInsurancePolicies, createInsurance, updateInsurance, deleteInsurance } from '@/services/crudService';
import { InsurancePolicy } from '@/types';
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
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Plus, Edit, Trash2, X } from 'lucide-react';
import InsuranceForm from '@/components/insurance/InsuranceForm';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import SortButton, { SortDirection, SortOption } from '@/components/common/SortButton';

const Insurance = () => {
  const [insurancePolicies, setInsurancePolicies] = useState<InsurancePolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [currentPolicy, setCurrentPolicy] = useState<InsurancePolicy | null>(null);
  const [policiesView, setPoliciesView] = useState<InsurancePolicy[]>([]);
  const [currentSort, setCurrentSort] = useState<string | null>(null);
  const [currentDirection, setCurrentDirection] = useState<SortDirection>(null);
  const { toast } = useToast();

  const sortOptions: SortOption[] = [
    { label: 'Provider', value: 'provider' },
    { label: 'Type', value: 'type' },
    { label: 'Coverage', value: 'coverAmount' },
    { label: 'Premium', value: 'premium' },
    { label: 'End Date', value: 'endDate' },
  ];

  useEffect(() => {
    fetchInsurancePolicies();
  }, []);

  useEffect(() => {
    if (insurancePolicies.length > 0) {
      const sortedPolicies = [...insurancePolicies];
      if (currentSort && currentDirection) {
        sortedPolicies.sort((a, b) => {
          const fieldA = a[currentSort as keyof InsurancePolicy];
          const fieldB = b[currentSort as keyof InsurancePolicy];
          
          // Handle different data types
          if (fieldA instanceof Date && fieldB instanceof Date) {
            return currentDirection === 'asc' 
              ? fieldA.getTime() - fieldB.getTime() 
              : fieldB.getTime() - fieldA.getTime();
          }
          
          if (typeof fieldA === 'string' && typeof fieldB === 'string') {
            return currentDirection === 'asc'
              ? fieldA.localeCompare(fieldB)
              : fieldB.localeCompare(fieldA);
          }
          
          if (typeof fieldA === 'number' && typeof fieldB === 'number') {
            return currentDirection === 'asc' ? fieldA - fieldB : fieldB - fieldA;
          }
          
          return 0;
        });
      }
      setPoliciesView(sortedPolicies);
    }
  }, [insurancePolicies, currentSort, currentDirection]);

  const fetchInsurancePolicies = async () => {
    try {
      const data = await getInsurancePolicies();
      setInsurancePolicies(data);
      setPoliciesView(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching insurance policies:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch insurance policies',
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  const handleAddPolicy = async (data: Omit<InsurancePolicy, 'id'>) => {
    try {
      const newPolicy = await createInsurance(data);
      setInsurancePolicies([...insurancePolicies, newPolicy]);
      toast({
        title: 'Success',
        description: 'Insurance policy added successfully',
      });
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error adding insurance policy:', error);
      toast({
        title: 'Error',
        description: 'Failed to add insurance policy',
        variant: 'destructive',
      });
    }
  };

  const handleUpdatePolicy = async (data: Omit<InsurancePolicy, 'id'>) => {
    if (!currentPolicy) return;
    
    try {
      const updatedPolicy = await updateInsurance(currentPolicy.id, data);
      if (updatedPolicy) {
        setInsurancePolicies(
          insurancePolicies.map((policy) => policy.id === currentPolicy.id ? updatedPolicy : policy)
        );
        toast({
          title: 'Success',
          description: 'Insurance policy updated successfully',
        });
      }
      setIsDialogOpen(false);
      setCurrentPolicy(null);
    } catch (error) {
      console.error('Error updating insurance policy:', error);
      toast({
        title: 'Error',
        description: 'Failed to update insurance policy',
        variant: 'destructive',
      });
    }
  };

  const handleDeletePolicy = async () => {
    if (!currentPolicy) return;
    
    try {
      const success = await deleteInsurance(currentPolicy.id);
      if (success) {
        setInsurancePolicies(
          insurancePolicies.filter((policy) => policy.id !== currentPolicy.id)
        );
        toast({
          title: 'Success',
          description: 'Insurance policy deleted successfully',
        });
      }
      setIsAlertOpen(false);
      setCurrentPolicy(null);
    } catch (error) {
      console.error('Error deleting insurance policy:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete insurance policy',
        variant: 'destructive',
      });
    }
  };

  const openEditDialog = (policy: InsurancePolicy) => {
    setCurrentPolicy(policy);
    setIsDialogOpen(true);
  };

  const openDeleteAlert = (policy: InsurancePolicy) => {
    setCurrentPolicy(policy);
    setIsAlertOpen(true);
  };

  const handleSortChange = (value: string, direction: SortDirection) => {
    setCurrentSort(direction ? value : null);
    setCurrentDirection(direction);
  };

  const getInsuranceTypeColor = (type: string) => {
    switch (type) {
      case 'Life':
      case 'Term':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100';
      case 'Health':
        return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100';
      case 'Vehicle':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-100';
      case 'Home':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
    }
  };

  const totalCoverAmount = policiesView.reduce((sum, policy) => sum + policy.coverAmount, 0);
  const totalAnnualPremium = policiesView.reduce((sum, policy) => {
    switch (policy.frequency) {
      case 'Monthly': return sum + (policy.premium * 12);
      case 'Quarterly': return sum + (policy.premium * 4);
      case 'Half-Yearly': return sum + (policy.premium * 2);
      case 'Yearly': return sum + policy.premium;
      default: return sum;
    }
  }, 0);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-lg">Loading insurance policies data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Insurance Policies</h1>
          <p className="text-muted-foreground">
            Manage and track your insurance policies
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-1">
              <Plus className="h-4 w-4" />
              Add Policy
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl bg-background">
            <DialogHeader>
              <DialogTitle>{currentPolicy ? 'Edit' : 'Add'} Insurance Policy</DialogTitle>
            </DialogHeader>
            <InsuranceForm 
              onSubmit={currentPolicy ? handleUpdatePolicy : handleAddPolicy}
              onCancel={() => {
                setIsDialogOpen(false);
                setCurrentPolicy(null);
              }}
              initialData={currentPolicy || undefined}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="finance-card">
          <CardHeader className="pb-2">
            <CardTitle>Total Coverage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="stat-value">₹{totalCoverAmount.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card className="finance-card">
          <CardHeader className="pb-2">
            <CardTitle>Annual Premium</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="stat-value">₹{totalAnnualPremium.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="finance-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Your Insurance Policies</CardTitle>
          <div>
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
            <TableCaption>All your insurance policies in one place</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Policy Number</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead className="text-right">Coverage</TableHead>
                <TableHead className="text-right">Premium</TableHead>
                <TableHead className="text-right">Frequency</TableHead>
                <TableHead className="text-right">Valid Until</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {policiesView.map((policy) => (
                <TableRow key={policy.id}>
                  <TableCell className="font-medium">{policy.policyNumber}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getInsuranceTypeColor(policy.type)}>
                      {policy.type}
                    </Badge>
                  </TableCell>
                  <TableCell>{policy.provider}</TableCell>
                  <TableCell className="text-right">₹{policy.coverAmount.toLocaleString()}</TableCell>
                  <TableCell className="text-right">₹{policy.premium.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{policy.frequency}</TableCell>
                  <TableCell className="text-right">{format(new Date(policy.endDate), 'dd MMM yyyy')}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(policy)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => openDeleteAlert(policy)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent className="bg-background">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Insurance Policy</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this insurance policy? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePolicy}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Insurance;
