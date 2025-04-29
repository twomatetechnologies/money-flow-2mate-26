
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { PlusIcon } from 'lucide-react';
import { GoalForm } from '@/components/goals/GoalForm';
import { GoalProgressCard } from '@/components/goals/GoalProgress';
import { createGoal, getGoals, calculateGoalProgress } from '@/services/goalService';
import { useToast } from '@/components/ui/use-toast';
import ImportExportMenu from '@/components/common/ImportExportMenu';
import { Goal } from '@/types/goals';
import { v4 as uuidv4 } from 'uuid';

export default function Goals() {
  const [goals, setGoals] = useState(getGoals());
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleCreateGoal = (data: any) => {
    const newGoal = createGoal(data);
    setGoals([...goals, newGoal]);
    setIsDialogOpen(false);
    toast({
      title: "Goal Created",
      description: "Your financial goal has been created successfully."
    });
  };

  // For export functionality
  const getExportData = (data: Goal[]) => {
    return data.map(goal => ({
      'Name': goal.name,
      'Type': goal.type,
      'Target Amount': goal.targetAmount,
      'Current Amount': goal.currentAmount,
      'Start Date': goal.startDate ? new Date(goal.startDate).toISOString().split('T')[0] : '',
      'Target Date': goal.targetDate ? new Date(goal.targetDate).toISOString().split('T')[0] : '',
      'Priority': goal.priority,
      'Notes': goal.notes || ''
    }));
  };

  // For sample data in import functionality
  const getSampleData = () => {
    const headers = [
      'Name',
      'Type',
      'Target Amount',
      'Current Amount',
      'Start Date',
      'Target Date',
      'Priority',
      'Notes'
    ];
    
    const data = [
      [
        'House Down Payment',
        'Housing',
        '1000000',
        '250000',
        '2023-01-01',
        '2025-12-31',
        'High',
        'Save for dream home'
      ],
      [
        'Retirement Fund',
        'Retirement',
        '5000000',
        '1000000',
        '2023-01-01',
        '2040-12-31',
        'Medium',
        'Long term retirement savings'
      ]
    ];
    
    return { headers, data };
  };

  // Validation for imported data
  const validateImportedData = (data: any[]) => {
    if (!Array.isArray(data) || data.length === 0) {
      return { valid: false, message: "No valid data found in the file" };
    }
    
    const requiredFields = ['Name', 'Type', 'Target Amount', 'Target Date'];
    const isValid = data.every(item => 
      requiredFields.every(field => item[field] !== undefined && item[field] !== '')
    );
    
    if (!isValid) {
      return { 
        valid: false, 
        message: "Some records are missing required fields. Required: Name, Type, Target Amount, Target Date" 
      };
    }
    
    return { valid: true };
  };

  // Handle import functionality
  const handleImport = async (importedData: any[]) => {
    try {
      const newGoals: Goal[] = [];
      
      for (const item of importedData) {
        try {
          const goalData = {
            name: item['Name'],
            type: item['Type'],
            targetAmount: parseFloat(item['Target Amount']) || 0,
            currentAmount: parseFloat(item['Current Amount']) || 0,
            startDate: new Date(item['Start Date'] || new Date()),
            targetDate: new Date(item['Target Date']),
            priority: item['Priority'] || 'Medium',
            notes: item['Notes'] || '',
            id: uuidv4(),
            createdAt: new Date(),
            updatedAt: new Date()
          };
          
          const newGoal = createGoal(goalData);
          newGoals.push(newGoal);
        } catch (error) {
          console.error("Error importing goal:", error);
        }
      }
      
      setGoals([...goals, ...newGoals]);
      
      toast({
        title: "Import completed",
        description: `Successfully imported ${newGoals.length} financial goals.`
      });
    } catch (error) {
      console.error('Error importing goals:', error);
      toast({
        title: 'Error',
        description: 'Failed to import financial goals',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financial Goals</h1>
          <p className="text-muted-foreground">
            Track and manage your financial goals
          </p>
        </div>
        <div className="flex space-x-2">
          <ImportExportMenu
            data={goals}
            onImport={handleImport}
            exportFilename="financial_goals"
            getExportData={getExportData}
            getSampleData={getSampleData}
            validateImportedData={validateImportedData}
          />
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusIcon className="h-4 w-4 mr-2" />
                Add New Goal
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Create New Financial Goal</DialogTitle>
              </DialogHeader>
              <GoalForm onSubmit={handleCreateGoal} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {goals.map(goal => (
          <GoalProgressCard 
            key={goal.id} 
            goal={goal}
            progress={calculateGoalProgress(goal)}
          />
        ))}
      </div>
    </div>
  );
}
