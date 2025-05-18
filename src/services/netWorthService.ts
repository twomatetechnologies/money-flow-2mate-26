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

    const stocksValue = (Array.isArray(stocksData) ? stocksData : []).reduce((sum, stock) => {
      // Ensure stock.value is used if present, otherwise calculate from currentPrice and quantity
      const value = typeof stock.value === 'number' ? stock.value : (stock.currentPrice || 0) * (stock.quantity || 0);
      return sum + value;
    }, 0);

    const fixedDepositsValue = (Array.isArray(fixedDepositsData) ? fixedDepositsData : []).reduce((sum, fd) => sum + (fd.principal || 0), 0);
    const sipValue = (Array.isArray(sipInvestmentsData) ? sipInvestmentsData : []).reduce((sum, sip) => sum + (sip.currentValue || 0), 0);
    const goldValue = (Array.isArray(goldInvestmentsData) ? goldInvestmentsData : []).reduce((sum, gold) => sum + (gold.value || 0), 0);
    const providentFundValue = (Array.isArray(providentFundsData) ? providentFundsData : []).reduce((sum, pf) => sum + (pf.totalBalance || 0), 0);
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
