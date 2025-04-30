
import { v4 as uuidv4 } from 'uuid';

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

// Function to load report snapshots from localStorage
const loadReportSnapshots = (): ReportSnapshot[] => {
  try {
    const stored = localStorage.getItem(REPORTS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : generateHistoricalSnapshots();
  } catch (error) {
    console.error('Error loading report snapshots:', error);
    return generateHistoricalSnapshots();
  }
};

// Function to save report snapshots to localStorage
const saveReportSnapshots = (snapshots: ReportSnapshot[]): void => {
  try {
    localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(snapshots));
  } catch (error) {
    console.error('Error saving report snapshots:', error);
  }
};

// Generate initial historical data if none exists
const generateHistoricalSnapshots = (): ReportSnapshot[] => {
  const snapshots: ReportSnapshot[] = [];
  const now = new Date();
  
  // Generate 12 months of historical data
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const baseNetWorth = 2000000; // Base value of ₹20 lakhs
    
    // Add some random variations to make the data look realistic
    const randomGrowth = 1 + ((Math.random() * 8 - 3) / 100); // -3% to +5% change
    const netWorth = Math.round(baseNetWorth * (1 + (0.04 * (12 - i))) * randomGrowth);
    
    // Random asset allocation but with consistent percentages that add up to 100%
    const stocksPercent = 25 + (Math.random() * 10 - 5);
    const fdPercent = 20 + (Math.random() * 8 - 4);
    const savingsPercent = 15 + (Math.random() * 6 - 3);
    const goldPercent = 15 + (Math.random() * 6 - 3);
    const pfPercent = 20 + (Math.random() * 8 - 4);
    
    // Normalize to ensure they add up to 100%
    const total = stocksPercent + fdPercent + savingsPercent + goldPercent + pfPercent;
    const normalizer = 100 / total;
    
    const snapshot: ReportSnapshot = {
      id: uuidv4(),
      date,
      netWorth,
      assetAllocation: {
        stocks: Math.round(stocksPercent * normalizer),
        fixedDeposits: Math.round(fdPercent * normalizer),
        savings: Math.round(savingsPercent * normalizer),
        gold: Math.round(goldPercent * normalizer),
        providentFund: Math.round(pfPercent * normalizer),
        other: 0, // Adjusted later
      },
      liabilities: Math.round(netWorth * 0.2 * (Math.random() * 0.4 + 0.8)), // 16-32% of net worth
      monthlyIncome: 80000 + Math.round(Math.random() * 20000), // ₹80k-100k
      monthlyExpenses: 50000 + Math.round(Math.random() * 15000), // ₹50k-65k
      savingsRate: 25 + Math.round(Math.random() * 10), // 25-35%
      createdAt: new Date(date.getFullYear(), date.getMonth(), 
        date.getDate() + Math.floor(Math.random() * 28))
    };
    
    // Ensure asset allocation adds up to exactly 100%
    const sum = Object.values(snapshot.assetAllocation).reduce((a, b) => a + b, 0);
    if (sum < 100) {
      snapshot.assetAllocation.other = 100 - sum;
    }
    
    snapshots.push(snapshot);
  }
  
  saveReportSnapshots(snapshots);
  return snapshots;
};

// In-memory store
let reportSnapshots = loadReportSnapshots();

// Get all financial report snapshots
export const getReportSnapshots = (): ReportSnapshot[] => {
  return [...reportSnapshots].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
};

// Get the most recent snapshot
export const getLatestSnapshot = (): ReportSnapshot => {
  const sorted = [...reportSnapshots].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  return sorted[0];
};

// Create a new financial snapshot (typically done monthly)
export const createReportSnapshot = (snapshot: Omit<ReportSnapshot, 'id' | 'createdAt'>): ReportSnapshot => {
  const newSnapshot: ReportSnapshot = {
    ...snapshot,
    id: uuidv4(),
    createdAt: new Date()
  };
  
  reportSnapshots.push(newSnapshot);
  saveReportSnapshots(reportSnapshots);
  
  return newSnapshot;
};

// Get data for a specific date range
export const getReportSnapshotsInRange = (
  startDate: Date, 
  endDate: Date
): ReportSnapshot[] => {
  return reportSnapshots.filter(snapshot => {
    const snapshotDate = new Date(snapshot.date);
    return snapshotDate >= startDate && snapshotDate <= endDate;
  }).sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
};

// Calculate growth rates over periods
export const calculateGrowthMetrics = () => {
  const sorted = [...reportSnapshots].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  if (sorted.length < 2) {
    return {
      monthOverMonth: 0,
      threeMonth: 0,
      sixMonth: 0,
      yearOverYear: 0
    };
  }
  
  const latest = sorted[sorted.length - 1];
  const oneMonthAgo = sorted.length >= 2 ? sorted[sorted.length - 2] : null;
  const threeMonthsAgo = sorted.length >= 4 ? sorted[sorted.length - 4] : null;
  const sixMonthsAgo = sorted.length >= 7 ? sorted[sorted.length - 7] : null; 
  const oneYearAgo = sorted.length >= 12 ? sorted[sorted.length - 12] : null;
  
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
