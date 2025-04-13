import React, { useEffect, useState } from 'react';
import { getGoldInvestments, createGold, updateGold, deleteGold } from '@/services/crudService';
import { GoldInvestment } from '@/types';
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
import { Plus, Edit, Trash2 } from 'lucide-react';
import GoldForm from '@/components/gold/GoldForm';
import FamilyMemberDisplay from '@/components/common/FamilyMemberDisplay';
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
import FamilyMemberFilter from '@/components/common/FamilyMemberFilter';

const Gold = () => {
  const [goldInvestments, setGoldInvestments] = useState<GoldInvestment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [currentInvestment, setCurrentInvestment] = useState<GoldInvestment | null>(null);
  const [investmentsView, setInvestmentsView] = useState<GoldInvestment[]>([]);
  const [currentSort, setCurrentSort] = useState<string | null>(null);
  const [currentDirection, setCurrentDirection] = useState<SortDirection>(null);
  const [selectedFamilyMember, setSelectedFamilyMember] = useState<string | null>(null);
  const { toast } = useToast();

  const sortOptions: SortOption[] = [
    { label: 'Type', value: 'type' },
    { label: 'Quantity', value: 'quantity' },
    { label: 'Purchase Date', value: 'purchaseDate' },
    { label: 'Current Value', value: 'value' },
    { label: 'Purchase Price', value: 'purchasePrice' },
    { label: 'Current Price', value: 'currentPrice' },
  ];

  useEffect(() => {
    fetchGoldInvestments();
  }, []);

  useEffect(() => {
    if (goldInvestments.length > 0) {
      let filteredInvestments = [...goldInvestments];
      
      // Apply family member filter
      if (selectedFamilyMember) {
        filteredInvestments = filteredInvestments.filter(
          investment => investment.familyMemberId === selectedFamilyMember
        );
      }
      
      // Apply sort
      if (currentSort && currentDirection) {
        filteredInvestments.sort((a, b) => {
          const fieldA = a[currentSort as keyof GoldInvestment];
          const fieldB = b[currentSort as keyof GoldInvestment];
          
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
      
      setInvestmentsView(filteredInvestments);
    }
  }, [goldInvestments, currentSort, currentDirection, selectedFamilyMember]);

  const fetchGoldInvestments = async () => {
    try {
      const data = await getGoldInvestments();
      setGoldInvestments(data);
      setInvestmentsView(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching gold investments:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch gold investments',
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  const handleAddInvestment = async (data: Omit<GoldInvestment, 'id'>) => {
    try {
      const newInvestment = await createGold(data);
      setGoldInvestments([...goldInvestments, newInvestment]);
      toast({
        title: 'Success',
        description: 'Gold investment added successfully',
      });
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error adding gold investment:', error);
      toast({
        title: 'Error',
        description: 'Failed to add gold investment',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateInvestment = async (data: Omit<GoldInvestment, 'id'>) => {
    if (!currentInvestment) return;
    
    try {
      const updatedInvestment = await updateGold(currentInvestment.id, data);
      if (updatedInvestment) {
        setGoldInvestments(
          goldInvestments.map((investment) => investment.id === currentInvestment.id ? updatedInvestment : investment)
        );
        toast({
          title: 'Success',
          description: 'Gold investment updated successfully',
        });
      }
      setIsDialogOpen(false);
      setCurrentInvestment(null);
    } catch (error) {
      console.error('Error updating gold investment:', error);
      toast({
        title: 'Error',
        description: 'Failed to update gold investment',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteInvestment = async () => {
    if (!currentInvestment) return;
    
    try {
      const success = await deleteGold(currentInvestment.id);
      if (success) {
        setGoldInvestments(
          goldInvestments.filter((investment) => investment.id !== currentInvestment.id)
        );
        toast({
          title: 'Success',
          description: 'Gold investment deleted successfully',
        });
      }
      setIsAlertOpen(false);
      setCurrentInvestment(null);
    } catch (error) {
      console.error('Error deleting gold investment:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete gold investment',
        variant: 'destructive',
      });
    }
  };

  const openEditDialog = (investment: GoldInvestment) => {
    setCurrentInvestment(investment);
    setIsDialogOpen(true);
  };

  const openDeleteAlert = (investment: GoldInvestment) => {
    setCurrentInvestment(investment);
    setIsAlertOpen(true);
  };

  const handleSortChange = (value: string, direction: SortDirection) => {
    setCurrentSort(direction ? value : null);
    setCurrentDirection(direction);
  };
  
  const handleFamilyMemberFilter = (memberId: string | null) => {
    setSelectedFamilyMember(memberId);
  };

  const getGoldTypeColor = (type: string) => {
    switch (type) {
      case 'Physical':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100';
      case 'Digital':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100';
      case 'ETF':
        return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100';
      case 'SGB':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
    }
  };

  const totalQuantity = investmentsView.reduce((sum, gold) => sum + gold.quantity, 0);
  const totalValue = investmentsView.reduce((sum, gold) => sum + gold.value, 0);
  const totalInvestment = investmentsView.reduce((sum, gold) => sum + (gold.purchasePrice * gold.quantity), 0);
  const totalGain = totalValue - totalInvestment;
  const percentGain = totalInvestment > 0 ? (totalGain / totalInvestment) * 100 : 0;

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-lg">Loading gold investments data...</p>
      </div>
    );
  }

  return (
    
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gold Investments</h1>
          <p className="text-muted-foreground">
            Track your gold investments across different forms
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-1">
              <Plus className="h-4 w-4" />
              Add Investment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl bg-background">
            <DialogHeader>
              <DialogTitle>{currentInvestment ? 'Edit' : 'Add'} Gold Investment</DialogTitle>
            </DialogHeader>
            <GoldForm 
              onSubmit={currentInvestment ? handleUpdateInvestment : handleAddInvestment}
              onCancel={() => {
                setIsDialogOpen(false);
                setCurrentInvestment(null);
              }}
              initialData={currentInvestment || undefined}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="finance-card">
          <CardHeader className="pb-2">
            <CardTitle>Total Gold</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="stat-value">{totalQuantity.toFixed(2)} grams</div>
          </CardContent>
        </Card>
        <Card className="finance-card">
          <CardHeader className="pb-2">
            <CardTitle>Current Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="stat-value">₹{totalValue.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card className="finance-card">
          <CardHeader className="pb-2">
            <CardTitle>Total Investment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="stat-value">₹{totalInvestment.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card className="finance-card">
          <CardHeader className="pb-2">
            <CardTitle>Total Gain/Loss</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`stat-value ${totalGain >= 0 ? 'trend-up' : 'trend-down'}`}>
              {totalGain >= 0 ? '+' : ''}₹{totalGain.toLocaleString()} ({percentGain.toFixed(2)}%)
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="finance-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Your Gold Investments</CardTitle>
          <div className="flex items-center space-x-2">
            <FamilyMemberFilter 
              selectedMemberId={selectedFamilyMember}
              onSelect={handleFamilyMemberFilter}
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
            <TableCaption>Your gold investments in various forms</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Purchase Date</TableHead>
                <TableHead className="text-right">Purchase Price</TableHead>
                <TableHead className="text-right">Current Price</TableHead>
                <TableHead className="text-right">Current Value</TableHead>
                <TableHead className="text-right">Gain/Loss</TableHead>
                <TableHead>Location/Notes</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {investmentsView.map((gold) => {
                const gain = (gold.currentPrice - gold.purchasePrice) * gold.quantity;
                const gainPercent = (gold.purchasePrice * gold.quantity) > 0 ? 
                  (gain / (gold.purchasePrice * gold.quantity)) * 100 : 0;
                
                return (
                  <TableRow key={gold.id}>
                    <TableCell>
                      <Badge variant="outline" className={getGoldTypeColor(gold.type)}>
                        {gold.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {gold.quantity} {gold.type === 'ETF' || gold.type === 'SGB' ? 'units' : 'grams'}
                    </TableCell>
                    <TableCell className="text-right">{format(new Date(gold.purchaseDate), 'dd MMM yyyy')}</TableCell>
                    <TableCell className="text-right">₹{gold.purchasePrice.toLocaleString()}</TableCell>
                    <TableCell className="text-right">₹{gold.currentPrice.toLocaleString()}</TableCell>
                    <TableCell className="text-right">₹{gold.value.toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <span className={gain >= 0 ? 'trend-up' : 'trend-down'}>
                        {gain >= 0 ? '+' : ''}₹{gain.toLocaleString()} ({gainPercent.toFixed(2)}%)
                      </span>
                    </TableCell>
                    <TableCell>{gold.location || gold.notes || '-'}</TableCell>
                    <TableCell>
                      <FamilyMemberDisplay memberId={gold.familyMemberId} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-1">
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(gold)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openDeleteAlert(gold)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent className="bg-background">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Gold Investment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this gold investment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteInvestment}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
    
  );
};

export default Gold;
