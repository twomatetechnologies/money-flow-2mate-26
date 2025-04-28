import { NetWorthData } from '@/types';
import { getStocks } from './stockService';
import { getFixedDeposits } from './fixedDepositService';
import { getSIPInvestments } from './sipInvestmentService';
import { getGoldInvestments } from './goldInvestmentService';
import { getProvidentFunds } from './providentFundService';

// Calculate net worth from all investment types
export const getNetWorth = async (): Promise<NetWorthData> => {
  try {
    // Fetch data from all services in parallel
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
    
    // Calculate total net worth (excluding insurance)
    const total = stocksTotal + fdTotal + sipTotal + goldTotal + pfTotal;
    
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
      // First entry - create some historical data for visualization
      const pastMonths = 11; // Generate 12 months of data (including today)
      const baseValue = total * 0.8; // Start with 80% of current total
      const monthlyGrowth = 0.02; // 2% monthly growth
      
      for (let i = pastMonths; i >= 0; i--) {
        const pastDate = new Date();
        pastDate.setMonth(today.getMonth() - i);
        pastDate.setDate(1);
        pastDate.setHours(0, 0, 0, 0);
        
        // Calculate a value with some growth trend and minor randomization
        const growthFactor = Math.pow(1 + monthlyGrowth, pastMonths - i);
        const randomFactor = 0.95 + Math.random() * 0.1; // Random between 0.95 and 1.05
        const historyValue = i === 0 ? total : baseValue * growthFactor * randomFactor;
        
        history.push({ date: pastDate, value: Math.round(historyValue) });
      }
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
    
    // Keep only the last 12 entries (approximately one year)
    if (history.length > 12) {
      history = history.slice(history.length - 12);
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
        providentFund: pfTotal,
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
        providentFund: 0,
        other: 0
      },
      history: []
    };
  }
};
