import { NetWorthData } from '@/types';
import { getStocks } from './stockService';
import { getFixedDeposits } from './fixedDepositService';
import { getSIPInvestments } from './sipInvestmentService';
import { getGoldInvestments } from './goldInvestmentService';

// Calculate net worth from all investment types
export const getNetWorth = async (): Promise<NetWorthData> => {
  try {
    // Fetch data from all services in parallel
    const [stocksData, fdData, sipData, goldData] = await Promise.all([
      getStocks(),
      getFixedDeposits(),
      getSIPInvestments(),
      getGoldInvestments()
    ]);
    
    // Calculate totals for each investment type
    const stocksTotal = stocksData.reduce((sum, stock) => sum + stock.value, 0);
    const fdTotal = fdData.reduce((sum, fd) => sum + fd.principal, 0);
    const sipTotal = sipData.reduce((sum, sip) => sum + sip.currentValue, 0);
    const goldTotal = goldData.reduce((sum, gold) => sum + gold.value, 0);
    
    // Calculate total net worth (excluding insurance)
    const total = stocksTotal + fdTotal + sipTotal + goldTotal;
    
    // Get historical data from localStorage
    let history: { date: Date; value: number }[] = [];
    try {
      const storedHistory = localStorage.getItem('netWorthHistory');
      if (storedHistory) {
        history = JSON.parse(storedHistory);
        // Convert string dates back to Date objects
        history = history.map(item => ({
          date: new Date(item.date),
          value: item.value
        }));
      }
    } catch (error) {
      console.error('Error loading net worth history:', error);
    }
    
    // Add today's value if it's a new day or update the latest entry
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (history.length === 0) {
      // First entry
      history.push({ date: today, value: total });
    } else {
      const lastEntry = history[history.length - 1];
      const lastDate = new Date(lastEntry.date);
      lastDate.setHours(0, 0, 0, 0);
      
      if (lastDate.getTime() === today.getTime()) {
        // Update today's entry
        history[history.length - 1] = { date: today, value: total };
      } else {
        // Add new entry for today
        history.push({ date: today, value: total });
      }
    }
    
    // Keep only the last 30 entries
    if (history.length > 30) {
      history = history.slice(history.length - 30);
    }
    
    // Save updated history back to localStorage
    try {
      localStorage.setItem('netWorthHistory', JSON.stringify(history));
    } catch (error) {
      console.error('Error saving net worth history:', error);
    }
    
    return {
      total: total,
      breakdown: {
        stocks: stocksTotal,
        fixedDeposits: fdTotal,
        sip: sipTotal,
        gold: goldTotal,
        other: 0 // Insurance excluded from net worth
      },
      history: history
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
        other: 0
      },
      history: []
    };
  }
};
