
export interface FinancialGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: Date;
  category: 'Savings' | 'Investment' | 'Retirement' | 'Education' | 'Other';
  notes?: string;
  createdAt: Date;
  lastUpdated: Date;
  
  // Add these fields to match what's being used in Goals.tsx
  type?: string;
  startDate?: Date;
  targetDate?: Date;
  priority?: 'Low' | 'Medium' | 'High';
  updatedAt?: Date;
}

// Add Goal as an alias for FinancialGoal
export type Goal = FinancialGoal;

export interface GoalProgress {
  percentageComplete: number;
  monthlyRequired: number;
  isOnTrack: boolean;
}
