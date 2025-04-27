
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financial Goals</h1>
          <p className="text-muted-foreground">
            Track and manage your financial goals
          </p>
        </div>
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
