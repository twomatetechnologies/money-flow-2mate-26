
import { MarketIndex } from '@/types';

// Simulates fetching market indices if API key is not available or API fails
export const getMarketIndices = async (apiKey?: string): Promise<MarketIndex[]> => {
  if (!apiKey) {
    console.warn('AlphaVantage API key not provided. Using simulated market data.');
    // Return more diverse simulated data
    return [
      { isSimulated: true, symbol: 'SIM_SPX', name: 'Simulated S&P 500', value: 4500.75, change: 15.25, changePercent: 0.34, lastUpdated: new Date() },
      { isSimulated: true, symbol: 'SIM_NDQ', name: 'Simulated Nasdaq 100', value: 15200.50, change: -50.10, changePercent: -0.33, lastUpdated: new Date() },
      { isSimulated: true, symbol: 'SIM_DJI', name: 'Simulated Dow Jones', value: 35000.00, change: 100.00, changePercent: 0.29, lastUpdated: new Date() },
    ];
  }

  // Example: Fetching S&P 500, Nasdaq 100, and Dow Jones
  // This is a simplified example. A real implementation would make actual API calls.
  // For now, we'll return simulated data even with an API key to avoid actual API calls in this context.
  console.log('Market Indices API call would be made here. Returning simulated data for now.');
  return [
    { isSimulated: false, symbol: 'SPX', name: 'S&P 500', value: 4510.75, change: 20.50, changePercent: 0.46, lastUpdated: new Date() },
    { isSimulated: false, symbol: 'NDQ', name: 'Nasdaq 100', value: 15250.60, change: -40.15, changePercent: -0.26, lastUpdated: new Date() },
    // Add more indices or fetch from actual API
  ];
};

export const fetchAllMarketIndices = async (apiKey?: string): Promise<MarketIndex[]> => {
  // In a real scenario, this might involve multiple API calls or more complex logic.
  // For now, it directly calls getMarketIndices.
  return getMarketIndices(apiKey);
};

export const startMarketIndicesMonitoring = (
  callback: (indices: MarketIndex[]) => void,
  interval: number,
  apiKey?: string
): (() => void) => {
  let isMounted = true;

  const fetchData = async () => {
    if (!isMounted) return;
    try {
      console.log('Monitoring: Fetching market indices...');
      const data = await fetchAllMarketIndices(apiKey);
      if (isMounted) {
        callback(data);
      }
    } catch (error) {
      console.error('Error fetching market indices during monitoring:', error);
      if (isMounted) {
        // Optionally, provide feedback about the error to the callback
        // callback([]); // Or an error state
      }
    }
  };

  fetchData(); // Initial fetch
  const intervalId = setInterval(fetchData, interval);

  return () => {
    isMounted = false;
    clearInterval(intervalId);
    console.log('Monitoring: Stopped market indices monitoring.');
  };
};


export const getAssetClasses = async (): Promise<string[]> => {
  // In a real application, these would likely come from a database or configuration.
  return Promise.resolve(['Stocks', 'Fixed Income', 'Real Estate', 'Commodities', 'Cash']);
};

export const getSectors = async (): Promise<string[]> => {
  // In a real application, these would likely come from a database or configuration.
  return Promise.resolve([
    'Technology',
    'Healthcare',
    'Financial Services',
    'Consumer Goods',
    'Industrials',
    'Energy',
    'Materials',
    'Utilities',
    'Real Estate',
    'Telecommunications'
  ]);
};

