import { v4 as uuidv4 } from 'uuid';
import { executeQuery } from './db/dbConnector';
import { createAuditRecord } from './auditService';

export interface ReportSnapshot {
  id: string;
  date: Date;
  netWorth: number;
  assetAllocation: {
    stocks: number;
    fixedDeposits: number;
    savings: number;
    gold: number;
    providentFund: number;
    other: number;
  };
  liabilities: number;
  monthlyExpenses: number;
  monthlyIncome: number;
  savingsRate: number;
  createdAt: Date;
}

// Growth metrics interface
export interface GrowthMetrics {
  monthOverMonth: number;
  threeMonth: number;
  sixMonth: number;
  yearOverYear: number;
}

// Function to get report snapshots from the database
export const getReportSnapshots = async (): Promise<ReportSnapshot[]> => {
  try {
    return await executeQuery<ReportSnapshot[]>('/reports/snapshots');
  } catch (error) {
    console.error('Error loading report snapshots:', error);
    throw error;
  }
};

// Function to save a new report snapshot
export const saveReportSnapshot = async (snapshot: Omit<ReportSnapshot, 'id' | 'createdAt'>): Promise<ReportSnapshot> => {
  try {
    const newSnapshot = {
      ...snapshot,
      id: `report-${uuidv4()}`,
      createdAt: new Date()
    };
    
    const result = await executeQuery<ReportSnapshot>('/reports/snapshots', 'POST', newSnapshot);
    
    // Create audit record
    await createAuditRecord(
      result.id,
      'report',
      'create',
      {
        date: result.date,
        netWorth: result.netWorth
      }
    );
    
    return result;
  } catch (error) {
    console.error('Error saving report snapshot:', error);
    throw error;
  }
};

// Function to delete all report snapshots
export const clearReportSnapshots = async (): Promise<boolean> => {
  try {
    await executeQuery('/reports/snapshots', 'DELETE');
    
    // Create audit record
    await createAuditRecord(
      'report-snapshots',
      'report',
      'clear',
      { message: 'All report snapshots cleared' }
    );
    
    return true;
  } catch (error) {
    console.error('Error clearing report snapshots:', error);
    throw error;
  }
};

// Function to generate a report for a specific date
export const generateReportForDate = async (date: Date): Promise<ReportSnapshot> => {
  try {
    return await executeQuery<ReportSnapshot>(`/reports/generate?date=${date.toISOString()}`);
  } catch (error) {
    console.error('Error generating report for date:', error);
    throw error;
  }
};

// Function to get the latest report snapshot
export const getLatestReportSnapshot = async (): Promise<ReportSnapshot | null> => {
  try {
    const snapshots = await getReportSnapshots();
    if (snapshots.length === 0) {
      return null;
    }
    
    // Sort by date in descending order and return the first one
    return snapshots.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  } catch (error) {
    console.error('Error getting latest report snapshot:', error);
    throw error;
  }
};

// Calculate growth metrics based on report snapshots
export const calculateGrowthMetrics = async (): Promise<GrowthMetrics> => {
  try {
    const snapshots = await getReportSnapshots();
    
    // Default metrics
    let metrics: GrowthMetrics = {
      monthOverMonth: 0,
      threeMonth: 0,
      sixMonth: 0,
      yearOverYear: 0
    };
    
    if (!snapshots || snapshots.length < 2) {
      return metrics; // Not enough data for comparison
    }
    
    // Sort snapshots by date, most recent first
    const sortedSnapshots = [...snapshots].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    const now = new Date();
    const mostRecent = sortedSnapshots[0];
    
    // Find snapshots for different time periods
    const oneMonthAgo = new Date(now);
    oneMonthAgo.setMonth(now.getMonth() - 1);
    
    const threeMonthsAgo = new Date(now);
    threeMonthsAgo.setMonth(now.getMonth() - 3);
    
    const sixMonthsAgo = new Date(now);
    sixMonthsAgo.setMonth(now.getMonth() - 6);
    
    const oneYearAgo = new Date(now);
    oneYearAgo.setFullYear(now.getFullYear() - 1);
    
    // Find closest snapshots to each time period
    const findClosestSnapshot = (targetDate: Date) => {
      return sortedSnapshots.reduce((closest, current) => {
        const currentDate = new Date(current.date);
        const closestDate = closest ? new Date(closest.date) : null;
        
        if (!closestDate) return current;
        
        const currentDiff = Math.abs(currentDate.getTime() - targetDate.getTime());
        const closestDiff = Math.abs(closestDate.getTime() - targetDate.getTime());
        
        return currentDiff < closestDiff ? current : closest;
      }, null as ReportSnapshot | null);
    };
    
    const oneMonthSnapshot = findClosestSnapshot(oneMonthAgo);
    const threeMonthSnapshot = findClosestSnapshot(threeMonthsAgo);
    const sixMonthSnapshot = findClosestSnapshot(sixMonthsAgo);
    const oneYearSnapshot = findClosestSnapshot(oneYearAgo);
    
    // Calculate growth percentages
    if (oneMonthSnapshot && oneMonthSnapshot.netWorth > 0) {
      metrics.monthOverMonth = ((mostRecent.netWorth - oneMonthSnapshot.netWorth) / oneMonthSnapshot.netWorth) * 100;
    }
    
    if (threeMonthSnapshot && threeMonthSnapshot.netWorth > 0) {
      metrics.threeMonth = ((mostRecent.netWorth - threeMonthSnapshot.netWorth) / threeMonthSnapshot.netWorth) * 100;
    }
    
    if (sixMonthSnapshot && sixMonthSnapshot.netWorth > 0) {
      metrics.sixMonth = ((mostRecent.netWorth - sixMonthSnapshot.netWorth) / sixMonthSnapshot.netWorth) * 100;
    }
    
    if (oneYearSnapshot && oneYearSnapshot.netWorth > 0) {
      metrics.yearOverYear = ((mostRecent.netWorth - oneYearSnapshot.netWorth) / oneYearSnapshot.netWorth) * 100;
    }
    
    return metrics;
  } catch (error) {
    console.error('Error calculating growth metrics:', error);
    return {
      monthOverMonth: 0,
      threeMonth: 0,
      sixMonth: 0,
      yearOverYear: 0
    };
  }
};
