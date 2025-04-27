
import { v4 as uuidv4 } from 'uuid';
import { FinancialGoal, GoalProgress } from '@/types/goals';

const GOALS_STORAGE_KEY = 'financialGoals';

const loadGoals = (): FinancialGoal[] => {
  try {
    const stored = localStorage.getItem(GOALS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading goals:', error);
    return [];
  }
};

const saveGoals = (goals: FinancialGoal[]): void => {
  try {
    localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(goals));
  } catch (error) {
    console.error('Error saving goals:', error);
  }
};

let goals = loadGoals();

export const createGoal = (goal: Omit<FinancialGoal, 'id' | 'createdAt' | 'lastUpdated'>): FinancialGoal => {
  const newGoal: FinancialGoal = {
    ...goal,
    id: uuidv4(),
    createdAt: new Date(),
    lastUpdated: new Date()
  };
  goals.push(newGoal);
  saveGoals(goals);
  return newGoal;
};

export const updateGoal = (id: string, updates: Partial<FinancialGoal>): FinancialGoal | null => {
  const index = goals.findIndex(goal => goal.id === id);
  if (index === -1) return null;

  goals[index] = {
    ...goals[index],
    ...updates,
    lastUpdated: new Date()
  };
  
  saveGoals(goals);
  return goals[index];
};

export const deleteGoal = (id: string): boolean => {
  const index = goals.findIndex(goal => goal.id === id);
  if (index === -1) return false;
  
  goals.splice(index, 1);
  saveGoals(goals);
  return true;
};

export const getGoals = (): FinancialGoal[] => {
  return goals;
};

export const calculateGoalProgress = (goal: FinancialGoal): GoalProgress => {
  const percentageComplete = (goal.currentAmount / goal.targetAmount) * 100;
  const today = new Date();
  const deadline = new Date(goal.deadline);
  const monthsLeft = (deadline.getFullYear() - today.getFullYear()) * 12 + 
                    (deadline.getMonth() - today.getMonth());
  
  const monthlyRequired = monthsLeft > 0 
    ? (goal.targetAmount - goal.currentAmount) / monthsLeft 
    : 0;
  
  const expectedProgress = (monthsLeft <= 0) ? 100 :
    ((Date.now() - goal.createdAt.getTime()) / 
     (deadline.getTime() - goal.createdAt.getTime())) * 100;
  
  const isOnTrack = percentageComplete >= expectedProgress;

  return {
    percentageComplete,
    monthlyRequired,
    isOnTrack
  };
};
