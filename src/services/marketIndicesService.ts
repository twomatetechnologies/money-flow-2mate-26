
import { toast } from '@/hooks/use-toast';

// Market index interface
export interface MarketIndex {
  symbol: string;
  name: string;
  value: number;
  change: number;
  changePercent: number;
  lastUpdated: Date;
}

// List of major market indices to track
const MARKET_INDICES = [
  { symbol: '^NSEI', name: 'Nifty 50' },
  { symbol: '^BSESN', name: 'Sensex' },
  { symbol: '^NSEBANK', name: 'Nifty Bank' },
  { symbol: '^CNXIT', name: 'Nifty IT' },
  { symbol: 'NIFTYMCAP100.NS', name: 'Nifty Midcap 100' }
];

// The Alpha Vantage API key (replace with your API key for production)
const ALPHA_VANTAGE_API_KEY = 'demo'; 

// Fetch the latest data for a market index
export const fetchMarketIndexData = async (symbol: string, name: string): Promise<MarketIndex | null> => {
  try {
    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`Error fetching market index data for ${symbol}: ${response.statusText}`);
      return null;
    }
    
    const data = await response.json();
    
    if (data['Global Quote'] && data['Global Quote']['05. price']) {
      const price = parseFloat(data['Global Quote']['05. price']);
      const change = parseFloat(data['Global Quote']['09. change'] || '0');
      const changePercent = parseFloat(data['Global Quote']['10. change percent']?.replace('%', '') || '0');
      
      return {
        symbol,
        name,
        value: price,
        change,
        changePercent,
        lastUpdated: new Date()
      };
    }
    
    // If using the demo key or rate-limited, simulate data
    if (data['Information'] && data['Information'].includes('demo')) {
      console.log(`Using simulated data for ${name} due to API limitations`);
      return simulateMarketIndexData(symbol, name);
    }
    
    console.error(`No index data found for ${symbol}`, data);
    return simulateMarketIndexData(symbol, name);
  } catch (error) {
    console.error(`Failed to fetch index data for ${symbol}:`, error);
    return simulateMarketIndexData(symbol, name);
  }
};

// Simulate market index data for demo purposes or when API fails
const simulateMarketIndexData = (symbol: string, name: string): MarketIndex => {
  // Create realistic baseline values for different indices
  let baseValue: number;
  switch(symbol) {
    case '^NSEI': baseValue = 22500; break;
    case '^BSESN': baseValue = 74000; break;
    case '^NSEBANK': baseValue = 48000; break;
    case '^CNXIT': baseValue = 32000; break;
    case 'NIFTYMCAP100.NS': baseValue = 14500; break;
    default: baseValue = 10000;
  }
  
  // Random fluctuation between -1% and +1%
  const changePercent = (Math.random() * 2 - 1);
  const change = (baseValue * changePercent) / 100;
  const value = baseValue + change;
  
  return {
    symbol,
    name,
    value,
    change,
    changePercent,
    lastUpdated: new Date()
  };
};

// Fetch all configured market indices
export const fetchAllMarketIndices = async (): Promise<MarketIndex[]> => {
  const indicesPromises = MARKET_INDICES.map(index => 
    fetchMarketIndexData(index.symbol, index.name)
  );
  
  const results = await Promise.all(indicesPromises);
  return results.filter((index): index is MarketIndex => index !== null);
};

// Start monitoring market indices in real-time
export const startMarketIndicesMonitoring = (
  onUpdate: (indices: MarketIndex[]) => void,
  refreshInterval = 60000 // Default 1 minute
) => {
  const updateIndices = async () => {
    try {
      const indices = await fetchAllMarketIndices();
      onUpdate(indices);
    } catch (error) {
      console.error("Error updating market indices:", error);
    }
  };
  
  // Initial update
  updateIndices();
  
  // Set up periodic updates
  const intervalId = setInterval(updateIndices, refreshInterval);
  
  // Return a function to stop monitoring
  return () => {
    if (intervalId) {
      clearInterval(intervalId);
      console.log("Market indices monitoring stopped");
    }
  };
};
