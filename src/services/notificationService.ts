
import { InsurancePolicy } from '@/types';
import { differenceInDays } from 'date-fns';

export interface PolicyNotification {
  id: string;
  policyNumber: string;
  type: string;
  provider: string;
  expiryDate: Date;
  daysRemaining: number;
  familyMemberId?: string;
}

// Check for policies expiring in the next 30 days
export const getUpcomingExpirations = (policies: InsurancePolicy[]): PolicyNotification[] => {
  const today = new Date();
  const upcomingExpirations: PolicyNotification[] = [];
  
  policies.forEach(policy => {
    const endDate = new Date(policy.endDate);
    const daysRemaining = differenceInDays(endDate, today);
    
    // Consider policies expiring in the next 30 days
    if (daysRemaining >= 0 && daysRemaining <= 30) {
      upcomingExpirations.push({
        id: policy.id,
        policyNumber: policy.policyNumber,
        type: policy.type,
        provider: policy.provider,
        expiryDate: endDate,
        daysRemaining,
        familyMemberId: policy.familyMemberId,
      });
    }
  });
  
  // Sort by days remaining (ascending)
  return upcomingExpirations.sort((a, b) => a.daysRemaining - b.daysRemaining);
};

// Get notification priority based on days remaining
export const getNotificationPriority = (daysRemaining: number): 'high' | 'medium' | 'low' => {
  if (daysRemaining <= 7) return 'high';
  if (daysRemaining <= 15) return 'medium';
  return 'low';
};

// Get notification color based on priority
export const getNotificationColor = (priority: 'high' | 'medium' | 'low'): string => {
  switch (priority) {
    case 'high':
      return 'text-red-500 bg-red-100 dark:bg-red-900/30 dark:text-red-300';
    case 'medium':
      return 'text-amber-500 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-300';
    case 'low':
      return 'text-blue-500 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300';
    default:
      return '';
  }
};
