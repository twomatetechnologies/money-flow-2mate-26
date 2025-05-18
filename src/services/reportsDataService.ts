
import { v4 as uuidv4 } from 'uuid';
import { getNetWorth } from './netWorthService';
import { NetWorthData } from '@/types';

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

const REPORTS_STORAGE_KEY = 'financialReports';

// Function to load report snapshots from localStorage or generate historical data
export const getReportSnapshots = async (): Promise<ReportSnapshot[]> => {
  try {
    const stored = localStorage.getItem(REPORTS_STORAGE_KEY);
    if (stored) {
      const snapshots: ReportSnapshot[] = JSON.parse(stored);
      
      // Convert string dates to Date objects
      return snapshots.map(snapshot => ({
        ...snapshot,
        date: new Date(snapshot.date),
        createdAt: new Date(snapshot.createdAt)
      }));
    }
    
    // Generate snapshots if none exist
    const netWorthData: NetWorthData = await getNetWorth();
    const snapshots = generateSnapshotsFromNetWorth(netWorthData.history);
    saveReportSnapshots(snapshots);
    return snapshots;
  } catch (error) {
    console.error('Error loading report snapshots:', error);
    // Fallback: if error, try to generate from current net worth, or return empty if that fails
    try {
        const netWorthData: NetWorthData = await getNetWorth();
        const snapshots = generateSnapshotsFromNetWorth(netWorthData.history);
        saveReportSnapshots(snapshots);
        return snapshots;
    } catch (fallbackError) {
        console.error('Error generating fallback snapshots:', fallbackError);
        return []; // Return empty array if all fails
    }
  }
};

// Save report snapshots to localStorage
const saveReportSnapshots = (snapshots: ReportSnapshot[]): void => {
  try {
    localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(snapshots));
  } catch (error) {
    console.error('Error saving report snapshots:', error);
  }
};

// Generate snapshots from provided net worth history
const generateSnapshotsFromNetWorth = (netWorthHistory: Array<{ date: Date; value: number }>): ReportSnapshot[] => {
  // Convert each history point to a snapshot with additional financial data
  const snapshots: ReportSnapshot[] = netWorthHistory.map(historyItem => {
    const netWorth = historyItem.value;
    const date = new Date(historyItem.date);
    
    // Generate realistic financial metrics from the net worth
    // These could be replaced with actual data in a real implementation
    const liabilities = Math.round(netWorth * (0.2 + Math.random() * 0.15)); // 20-35% of net worth
    const monthlyIncome = Math.round(netWorth * 0.04 / 12); // Roughly 4% annual return divided by 12
    const monthlyExpenses = Math.round(monthlyIncome * (0.6 + Math.random() * 0.2)); // 60-80% of income
    const savingsRate = monthlyIncome > 0 ? Math.round(100 * (1 - (monthlyExpenses / monthlyIncome))) : 0;
    
    // Generate realistic asset allocation based on the date
    // This mimics changing allocation strategies over time
    const totalAssetPercentage = 100;
    const monthIndex = date.getMonth();
    
    // Slight variation in allocation based on month (simulating market changes)
    const stockPercent = 25 + (Math.sin(monthIndex) * 8);
    const fdPercent = 20 + (Math.cos(monthIndex) * 5);
    const savingsPercent = 15 + (Math.sin(monthIndex + 2) * 3);
    const goldPercent = 15 + (Math.cos(monthIndex + 1) * 4);
    const pfPercent = 20 + (Math.sin(monthIndex + 3) * 5);
    
    // Normalize to ensure they add up to 100%
    const total = stockPercent + fdPercent + savingsPercent + goldPercent + pfPercent;
    const normalizer = total > 0 ? totalAssetPercentage / total : 0;
    
    const assetAllocation = {
        stocks: Math.round(stockPercent * normalizer),
        fixedDeposits: Math.round(fdPercent * normalizer),
        savings: Math.round(savingsPercent * normalizer),
        gold: Math.round(goldPercent * normalizer),
        providentFund: Math.round(pfPercent * normalizer),
        other: 0 // Initialize other
    };

    // Adjust 'other' to make the sum exactly 100%
    const currentTotalAllocation = Object.values(assetAllocation).reduce((sum, val) => sum + val, 0) - assetAllocation.other;
    assetAllocation.other = Math.max(0, totalAssetPercentage - currentTotalAllocation);
    
    return {
      id: uuidv4(),
      date,
      netWorth,
      assetAllocation,
      liabilities,
      monthlyExpenses,
      monthlyIncome,
      savingsRate,
      createdAt: new Date(date.getFullYear(), date.getMonth(), 
        date.getDate() + Math.floor(Math.random() * 7)) // Created within a week of the date
    };
  });
  
  // Sort by date
  return snapshots.sort((a, b) => a.date.getTime() - b.date.getTime());
};

// Get the most recent snapshot
export const getLatestSnapshot = async (): Promise<ReportSnapshot | undefined> => {
  const snapshots = await getReportSnapshots();
  if (!snapshots || snapshots.length === 0) {
    return undefined;
  }
  
  const sorted = [...snapshots].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  return sorted[0];
};

// Create a new financial snapshot
export const createReportSnapshot = async (snapshot: Omit<ReportSnapshot, 'id' | 'createdAt'>): Promise<ReportSnapshot> => {
  const snapshots = await getReportSnapshots();
  
  const newSnapshot: ReportSnapshot = {
    ...snapshot,
    id: uuidv4(),
    createdAt: new Date()
  };
  
  snapshots.push(newSnapshot);
  saveReportSnapshots(snapshots);
  
  return newSnapshot;
};

// Get data for a specific date range
export const getReportSnapshotsInRange = async (
  startDate: Date, 
  endDate: Date
): Promise<ReportSnapshot[]> => {
  const snapshots = await getReportSnapshots();
  
  return snapshots.filter(snapshot => {
    const snapshotDate = new Date(snapshot.date);
    return snapshotDate >= startDate && snapshotDate <= endDate;
  }).sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
};

// Calculate growth rates over periods
export const calculateGrowthMetrics = async () => {
  const snapshots = await getReportSnapshots();
  
  if (snapshots.length < 2) {
    return {
      monthOverMonth: 0,
      threeMonth: 0,
      sixMonth: 0,
      yearOverYear: 0
    };
  }
  
  const sorted = [...snapshots].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  const latest = sorted[sorted.length - 1];
  if (!latest) { // Should not happen if length >= 2, but good for type safety
    return { monthOverMonth: 0, threeMonth: 0, sixMonth: 0, yearOverYear: 0 };
  }
  
  // Find snapshot closest to one month ago
  const oneMonthAgo = findClosestSnapshot(sorted, 1);
  // Find snapshot closest to three months ago
  const threeMonthsAgo = findClosestSnapshot(sorted, 3);
  // Find snapshot closest to six months ago
  const sixMonthsAgo = findClosestSnapshot(sorted, 6);
  // Find snapshot closest to one year ago
  const oneYearAgo = findClosestSnapshot(sorted, 12);
  
  return {
    monthOverMonth: oneMonthAgo ? 
      ((latest.netWorth - oneMonthAgo.netWorth) / oneMonthAgo.netWorth) * 100 : 0,
    threeMonth: threeMonthsAgo ? 
      ((latest.netWorth - threeMonthsAgo.netWorth) / threeMonthsAgo.netWorth) * 100 : 0,
    sixMonth: sixMonthsAgo ? 
      ((latest.netWorth - sixMonthsAgo.netWorth) / sixMonthsAgo.netWorth) * 100 : 0,
    yearOverYear: oneYearAgo ? 
      ((latest.netWorth - oneYearAgo.netWorth) / oneYearAgo.netWorth) * 100 : 0
  };
};

// Find the snapshot closest to X months ago from the most recent snapshot
const findClosestSnapshot = (sortedSnapshots: ReportSnapshot[], monthsAgo: number): ReportSnapshot | null => {
  if (sortedSnapshots.length === 0) return null; // Handle empty array
  
  const latest = sortedSnapshots[sortedSnapshots.length - 1];
  if (!latest) return null; // Should not happen if length > 0
  const latestDate = new Date(latest.date);
  
  // Calculate target date
  const targetDate = new Date(latestDate);
  targetDate.setMonth(targetDate.getMonth() - monthsAgo);
  
  // Filter out snapshots newer than the target date (or same month as latest if monthsAgo is small)
  const relevantSnapshots = sortedSnapshots.filter(s => new Date(s.date) < latestDate);
  if (relevantSnapshots.length === 0) return null;

  // Find closest snapshot to target date from the relevant ones
  let closest = relevantSnapshots[0];
  if (!closest) return null; // Should not happen
  let closestDiff = Math.abs(new Date(closest.date).getTime() - targetDate.getTime());
  
  for (let i = 1; i < relevantSnapshots.length; i++) {
    const current = relevantSnapshots[i];
    if (!current) continue; // Should not happen
    const currentDiff = Math.abs(new Date(current.date).getTime() - targetDate.getTime());
    
    if (currentDiff < closestDiff) {
      closest = current;
      closestDiff = currentDiff;
    }
  }
  
  return closest;
};

// Clear all report snapshots (useful for debugging)
export const clearReportSnapshots = (): void => {
  try {
    localStorage.removeItem(REPORTS_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing report snapshots:', error);
  }
};

// Refresh report data from net worth history
export const refreshReportData = async (): Promise<void> => {
  clearReportSnapshots();
  await getReportSnapshots();
};

