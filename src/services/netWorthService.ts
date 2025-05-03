
import { NetWorthData } from '@/types';
import { getStocks } from './stockService';
import { getFixedDeposits } from './fixedDepositService';
import { getSIPInvestments } from './sipInvestmentService';
import { getGoldInvestments } from './goldInvestmentService';
import { getProvidentFunds } from './providentFundService';
import { formatIndianNumber } from '@/lib/utils';

// Storage key for net worth history
const NET_WORTH_HISTORY_KEY = 'netWorthHistory';

// Calculate net worth from all investment types
export const getNetWorth = async (): Promise<NetWorthData> => {
  try {
    // Fetch data from all services in parallel for better performance
    const [stocksData, fdData, sipData, goldData, pfData] = await Promise.all([
      getStocks(),
      getFixedDeposits(),
      getSIPInvestments(),
      getGoldInvestments(),
      getProvidentFunds()
    ]);
    
    // Calculate totals for each investment type
    const stocksTotal = stocksData.reduce((sum, stock) => sum + (stock.currentPrice * stock.quantity), 0);
    const fdTotal = fdData.reduce((sum, fd) => sum + fd.principal, 0);
    const sipTotal = sipData.reduce((sum, sip) => sum + sip.currentValue, 0);
    const goldTotal = goldData.reduce((sum, gold) => sum + gold.value, 0);
    const pfTotal = pfData.reduce((sum, pf) => sum + pf.totalBalance, 0);
    
    // Calculate total net worth
    const total = stocksTotal + fdTotal + sipTotal + goldTotal + pfTotal;
    
    // Load historical net worth data
    const history = getNetWorthHistory();
    
    // Update with today's net worth
    updateNetWorthHistory(history, total);
    
    return {
      total,
      breakdown: {
        stocks: stocksTotal,
        fixedDeposits: fdTotal,
        sip: sipTotal,
        gold: goldTotal,
        providentFund: pfTotal,
        other: 0
      },
      history
    };
  } catch (error) {
    console.error('Error calculating net worth:', error);
    return {
      total: 0,
      breakdown: {
        stocks: 0,
        fixedDeposits: 0,
        sip: 0,
        gold: 0,
        providentFund: 0,
        other: 0
      },
      history: []
    };
  }
};

// Get net worth history from localStorage
export const getNetWorthHistory = (): { date: Date; value: number }[] => {
  try {
    const storedHistory = localStorage.getItem(NET_WORTH_HISTORY_KEY);
    if (storedHistory) {
      const history = JSON.parse(storedHistory);
      // Convert string dates back to Date objects
      return history.map((item: any) => ({
        date: new Date(item.date),
        value: item.value
      }));
    }
    
    // Create initial empty history if none exists
    return createInitialHistory();
  } catch (error) {
    console.error('Error loading net worth history:', error);
    return createInitialHistory();
  }
};

// Update net worth history with today's value
const updateNetWorthHistory = (
  history: { date: Date; value: number }[],
  todayNetWorth: number
): void => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let updated = false;
  
  if (history.length > 0) {
    const lastEntry = history[history.length - 1];
    const lastDate = new Date(lastEntry.date);
    lastDate.setHours(0, 0, 0, 0);
    
    if (lastDate.getTime() === today.getTime()) {
      // Update today's entry
      history[history.length - 1] = { date: today, value: todayNetWorth };
      updated = true;
    }
  }
  
  if (!updated) {
    // Add new entry for today
    history.push({ date: today, value: todayNetWorth });
  }
  
  // Save updated history back to localStorage
  try {
    localStorage.setItem(NET_WORTH_HISTORY_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('Error saving net worth history:', error);
  }
};

// Create initial history with some historical data points
const createInitialHistory = (): { date: Date; value: number }[] => {
  const history: { date: Date; value: number }[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Generate 12 months of historical data
  for (let i = 11; i >= 0; i--) {
    const pastDate = new Date();
    pastDate.setMonth(today.getMonth() - i);
    pastDate.setDate(1);
    pastDate.setHours(0, 0, 0, 0);
    
    // Generate a semi-realistic value with growth trend
    // Starting with ₹15 lakhs and 3% monthly growth with some randomness
    const baseValue = 1500000;
    const growthFactor = Math.pow(1.03, i);
    const randomFactor = 0.95 + Math.random() * 0.1; // Random between 0.95 and 1.05
    const historyValue = baseValue * growthFactor * randomFactor;
    
    history.push({ date: pastDate, value: Math.round(historyValue) });
  }
  
  // Save this initial history
  try {
    localStorage.setItem(NET_WORTH_HISTORY_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('Error saving initial net worth history:', error);
  }
  
  return history;
};

// Clear the stored net worth history - useful for testing or resetting
export const clearNetWorthHistory = (): void => {
  try {
    localStorage.removeItem(NET_WORTH_HISTORY_KEY);
  } catch (error) {
    console.error('Error clearing net worth history:', error);
  }
};

// Add a manual entry to net worth history
export const addNetWorthHistoryEntry = (date: Date, value: number): void => {
  try {
    const history = getNetWorthHistory();
    
    // Convert to date without time
    const entryDate = new Date(date);
    entryDate.setHours(0, 0, 0, 0);
    
    // Check if entry for this date already exists
    const existingIndex = history.findIndex(item => {
      const itemDate = new Date(item.date);
      itemDate.setHours(0, 0, 0, 0);
      return itemDate.getTime() === entryDate.getTime();
    });
    
    if (existingIndex >= 0) {
      // Update existing entry
      history[existingIndex].value = value;
    } else {
      // Add new entry
      history.push({ date: entryDate, value });
      
      // Sort by date
      history.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }
    
    // Save updated history
    localStorage.setItem(NET_WORTH_HISTORY_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('Error adding net worth history entry:', error);
  }
};

// Get net worth breakdown for display purposes
export const getNetWorthBreakdown = async (): Promise<Record<string, { value: number; percentage: number }>> => {
  const netWorth = await getNetWorth();
  
  const result: Record<string, { value: number; percentage: number }> = {};
  let total = netWorth.total;
  
  if (total === 0) total = 1; // Prevent division by zero
  
  Object.entries(netWorth.breakdown).forEach(([key, value]) => {
    result[key] = {
      value,
      percentage: (value / total) * 100
    };
  });
  
  return result;
};
