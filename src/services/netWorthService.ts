import { NetWorthData, StockHolding, FixedDeposit, SIPInvestment, GoldInvestment, ProvidentFund } from '@/types';
import { getStocks } from './stockService';
import { getFixedDeposits } from './fixedDepositService';
import { getSIPInvestments } from './sipInvestmentService';
import { getGoldInvestments } from './goldInvestmentService';
import { getProvidentFunds } from './providentFundService';
// Assuming getOtherAssets might be a future service, for now, 'other' will be 0.

// Helper function to generate a simple history based on the current total
const generateHistory = (currentTotal: number, points: number = 12): Array<{ date: Date; value: number }> => {
  const history: Array<{ date: Date; value: number }> = [];
  const today = new Date();
  for (let i = points - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setMonth(today.getMonth() - i);
    // Simulate some variation for past months, ending with currentTotal for the current month
    let value;
    if (i === 0) { // Current month
      value = currentTotal;
    } else {
      // Simulate a general upward trend with some randomness
      const randomFactor = 1 - (Math.random() * 0.05 + (points - 1 - i) * 0.01); // decreasing random factor for older points
      value = Math.max(0, Math.round(currentTotal * randomFactor));
    }
    history.push({ date, value });
  }
  return history;
};

export const getNetWorth = async (): Promise<NetWorthData> => {
  try {
    const [
      stocksData,
      fixedDepositsData,
      sipInvestmentsData,
      goldInvestmentsData,
      providentFundsData
      // otherAssetsData // Placeholder for future 'other' assets
    ] = await Promise.all([
      getStocks(),
      getFixedDeposits(),
      getSIPInvestments(),
      getGoldInvestments(),
      getProvidentFunds(),
      // getOtherAssets() // Placeholder
    ]);

    // Define a safe parsing function for numeric values that might be strings
    const safeParseFloat = (value: any): number => {
      if (value === null || value === undefined) return 0;
      if (typeof value === 'number') return value;
      if (typeof value === 'string') return parseFloat(value) || 0;
      return 0;
    };

    const stocksValue = (Array.isArray(stocksData) ? stocksData : []).reduce((sum, stock) => {
      // Ensure stock.value is used if present, otherwise calculate from currentPrice and quantity
      // Handle the case where stock.value is a string (with quotes) instead of a number
      return sum + safeParseFloat(stock.value || 
                   (safeParseFloat(stock.currentPrice) * safeParseFloat(stock.quantity)));
    }, 0);
    
    const fixedDepositsValue = (Array.isArray(fixedDepositsData) ? fixedDepositsData : []).reduce((sum, fd) => {
      const value = safeParseFloat(fd.principal);
      return sum + value;
    }, 0);
    
    const sipValue = (Array.isArray(sipInvestmentsData) ? sipInvestmentsData : []).reduce((sum, sip) => {
      const value = safeParseFloat(sip.currentValue);
      return sum + value;
    }, 0);
    
    const goldValue = (Array.isArray(goldInvestmentsData) ? goldInvestmentsData : []).reduce((sum, gold) => {
      const value = safeParseFloat(gold.value);
      return sum + value;
    }, 0);
    
    const providentFundValue = (Array.isArray(providentFundsData) ? providentFundsData : []).reduce((sum, pf) => {
      // Use index signature to access properties that might have different names
      const pfAny = pf as any;
      const balance = pfAny.total_balance !== undefined ? pfAny.total_balance : 
                     (pfAny.totalBalance !== undefined ? pfAny.totalBalance : 0);
      return sum + safeParseFloat(balance);
    }, 0);
    
    const otherAssetsValue = 0; // No service for 'other' assets yet

    const totalNetWorth = stocksValue + fixedDepositsValue + sipValue + goldValue + providentFundValue + otherAssetsValue;

    const netWorthBreakdown = {
      stocks: stocksValue,
      fixedDeposits: fixedDepositsValue,
      sip: sipValue,
      gold: goldValue,
      providentFund: providentFundValue,
      other: otherAssetsValue,
    };

    const history = generateHistory(totalNetWorth);

    return {
      total: totalNetWorth,
      breakdown: netWorthBreakdown,
      history: history,
    };

  } catch (error) {
    console.error('Error calculating net worth:', error);
    // Fallback to a default/empty structure in case of error
    return {
      total: 0,
      breakdown: {
        stocks: 0,
        fixedDeposits: 0,
        sip: 0,
        gold: 0,
        providentFund: 0,
        other: 0,
      },
      history: generateHistory(0),
    };
  }
};
