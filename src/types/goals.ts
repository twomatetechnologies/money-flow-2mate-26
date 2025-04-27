
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
}

export interface GoalProgress {
  percentageComplete: number;
  monthlyRequired: number;
  isOnTrack: boolean;
}
