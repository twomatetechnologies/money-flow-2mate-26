
import { executeQuery } from './db/dbConnector';
import { createAuditRecord } from './auditService';

// Define the interfaces for Financial Goals
interface FinancialGoal {
  id: string;
  name: string;
  description?: string;
  targetAmount: number;
  currentAmount: number;
  deadline: Date;
  category: string;
  priority: 'Low' | 'Medium' | 'High';
  createdAt: Date;
  lastUpdated: Date;
  familyMemberId?: string;
}

interface GoalProgress {
  percentageComplete: number;
  monthlyRequired: number;
  isOnTrack: boolean;
}

const API_BASE_URL = '/goals';

// Create a new financial goal - PostgreSQL only
export const createGoal = async (goal: Omit<FinancialGoal, 'id' | 'createdAt' | 'lastUpdated'>): Promise<FinancialGoal> => {
  try {
    const newGoal = await executeQuery<FinancialGoal>(API_BASE_URL, 'POST', goal);
    createAuditRecord(newGoal.id, 'user', 'create', newGoal);
    return newGoal;
  } catch (error) {
    console.error('Error creating financial goal:', error);
    throw new Error('Failed to create financial goal. Database connection required.');
  }
};

// Update a financial goal - PostgreSQL only
export const updateGoal = async (id: string, updates: Partial<FinancialGoal>): Promise<FinancialGoal | null> => {
  try {
    const updatedGoal = await executeQuery<FinancialGoal>(`${API_BASE_URL}/${id}`, 'PUT', updates);
    createAuditRecord(id, 'user', 'update', {
      current: updatedGoal,
      changes: updates
    });
    return updatedGoal;
  } catch (error) {
    console.error(`Error updating financial goal ${id}:`, error);
    throw new Error(`Failed to update financial goal. Database connection required.`);
  }
};

// Delete a financial goal - PostgreSQL only
export const deleteGoal = async (id: string): Promise<boolean> => {
  try {
    await executeQuery<{ success: boolean }>(`${API_BASE_URL}/${id}`, 'DELETE');
    createAuditRecord(id, 'user', 'delete', { id });
    return true;
  } catch (error) {
    console.error(`Error deleting financial goal ${id}:`, error);
    throw new Error(`Failed to delete financial goal. Database connection required.`);
  }
};

// Get all financial goals - PostgreSQL only
export const getGoals = async (): Promise<FinancialGoal[]> => {
  try {
    return await executeQuery<FinancialGoal[]>(API_BASE_URL, 'GET');
  } catch (error) {
    console.error('Error fetching financial goals:', error);
    throw new Error('Failed to fetch financial goals. Database connection required.');
  }
};

// Calculate progress for a financial goal
export const calculateGoalProgress = (goal: FinancialGoal): GoalProgress => {
  // Safely handle null or undefined values
  if (!goal) {
    return { percentageComplete: 0, monthlyRequired: 0, isOnTrack: false };
  }

  const percentageComplete = (goal.currentAmount / goal.targetAmount) * 100;
  const today = new Date();
  
  // Ensure deadline is a Date object
  const deadline = goal.deadline instanceof Date ? goal.deadline : new Date(goal.deadline);
  
  const monthsLeft = (deadline.getFullYear() - today.getFullYear()) * 12 + 
                    (deadline.getMonth() - today.getMonth());
  
  const monthlyRequired = monthsLeft > 0 
    ? (goal.targetAmount - goal.currentAmount) / monthsLeft 
    : 0;
  
  // Ensure createdAt is a Date object before calling getTime()
  // Use a try-catch to handle potential invalid date strings
  let createdAtDate;
  try {
    createdAtDate = goal.createdAt instanceof Date ? goal.createdAt : new Date(goal.createdAt);
    // Validate that the date is valid
    if (isNaN(createdAtDate.getTime())) {
      createdAtDate = new Date(); // Fallback to current date if invalid
      console.warn('Invalid createdAt date detected in goal, using current date as fallback');
    }
  } catch (error) {
    console.error('Error parsing createdAt date:', error);
    createdAtDate = new Date(); // Fallback to current date
  }
  
  const expectedProgress = (monthsLeft <= 0) ? 100 :
    ((Date.now() - createdAtDate.getTime()) / 
     (deadline.getTime() - createdAtDate.getTime())) * 100;
  
  const isOnTrack = percentageComplete >= expectedProgress;

  return {
    percentageComplete,
    monthlyRequired,
    isOnTrack
  };
};
