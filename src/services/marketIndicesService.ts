import { toast } from '@/hooks/use-toast';

// Market index interface
export interface MarketIndex {
  symbol: string;
  name: string;
  value: number;
  change: number;
  changePercent: number;
  lastUpdated: Date;
  isSimulated?: boolean; // Added to track if data is simulated
}

// List of major market indices to track
const MARKET_INDICES = [
  { symbol: '^NSEI', name: 'Nifty 50' },
  { symbol: '^BSESN', name: 'Sensex' },
  { symbol: '^NSEBANK', name: 'Nifty Bank' },
  { symbol: '^CNXIT', name: 'Nifty IT' },
  { symbol: 'NIFTYMCAP100.NS', name: 'Nifty Midcap 100' }
];

// The Alpha Vantage API key
const ALPHA_VANTAGE_API_KEY = 'LR78N65XUDF2EZDB'; // Using demo key for now

// Financial Modeling Prep API key (free tier)
const FMP_API_KEY = 'LR78N65XUDF2EZDB';

// Fetch the latest data for a market index
export const fetchMarketIndexData = async (symbol: string, name: string): Promise<MarketIndex> => {
  try {
    // First, try Alpha Vantage API
    const avData = await fetchFromAlphaVantage(symbol);
    if (avData) return { ...avData, isSimulated: false };
    
    // If Alpha Vantage fails, try Financial Modeling Prep API
    const fmpData = await fetchFromFMP(symbol, name);
    if (fmpData) return { ...fmpData, isSimulated: false };
    
    // If both APIs fail, fallback to simulated data
    console.warn(`Falling back to simulated data for ${symbol} after API failures.`);
    return simulateMarketIndexData(symbol, name);
  } catch (error) {
    console.error(`Failed to fetch index data for ${symbol}:`, error);
    return simulateMarketIndexData(symbol, name);
  }
};

const fetchFromAlphaVantage = async (symbol: string): Promise<Omit<MarketIndex, 'isSimulated' | 'lastUpdated'> | null> => {
  try {
    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`Error fetching market index data from Alpha Vantage for ${symbol}: ${response.statusText}`);
      return null;
    }
    
    const data = await response.json();
    
    if (data['Global Quote'] && data['Global Quote']['05. price']) {
      const price = parseFloat(data['Global Quote']['05. price']);
      const change = parseFloat(data['Global Quote']['09. change'] || '0');
      const changePercent = parseFloat(data['Global Quote']['10. change percent']?.replace('%', '') || '0');
      
      if (isNaN(price) || isNaN(change) || isNaN(changePercent)) {
        console.error(`Invalid data received from Alpha Vantage for ${symbol}:`, data['Global Quote']);
        return null;
      }

      return {
        symbol,
        name: data['Global Quote']['01. symbol'] || symbol.replace('^', '').replace('.NS', ''), // Prefer name from API if available
        value: price,
        change,
        changePercent,
        // lastUpdated will be set in fetchMarketIndexData or by the caller if needed from here
      };
    }
    if (data.Note) { // Alpha Vantage demo key often returns a note about call frequency
        console.warn(`Alpha Vantage API note for ${symbol}: ${data.Note}`);
    }
    
    return null;
  } catch (error) {
    console.error(`Alpha Vantage API error for ${symbol}:`, error);
    return null;
  }
};

const fetchFromFMP = async (symbol: string, name: string): Promise<Omit<MarketIndex, 'isSimulated' | 'lastUpdated'> | null> => {
  try {
    // Convert Alpha Vantage symbol format to FMP format if necessary
    // For Indian indices, FMP might use different symbols (e.g., NIFTY.IND for Nifty 50)
    // This example keeps the provided symbol, adjust if FMP uses different tickers
    const fmpSymbol = symbol.replace('^', '%5E'); // Basic conversion
    
    const url = `https://financialmodelingprep.com/api/v3/quote/${fmpSymbol}?apikey=${FMP_API_KEY}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`Error fetching market index data from FMP for ${symbol}: ${response.statusText}`);
      return null;
    }
    
    const data = await response.json();
    
    if (data && data.length > 0) {
      const indexData = data[0];
      if (indexData.price === undefined || indexData.price === null ||
          indexData.change === undefined || indexData.change === null ||
          indexData.changesPercentage === undefined || indexData.changesPercentage === null) {
        console.error(`Invalid data received from FMP for ${symbol}:`, indexData);
        return null;
      }
      return {
        symbol,
        name: indexData.name || name, // Prefer name from API
        value: indexData.price,
        change: indexData.change,
        changePercent: indexData.changesPercentage,
        // lastUpdated will be set in fetchMarketIndexData
      };
    }
    
    return null;
  } catch (error) {
    console.error(`FMP API error for ${symbol}:`, error);
    return null;
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
  
  console.log(`Simulating data for ${name} (${symbol})`);
  return {
    symbol,
    name,
    value,
    change,
    changePercent,
    lastUpdated: new Date(),
    isSimulated: true, // Mark as simulated
  };
};

// Fetch all configured market indices
export const fetchAllMarketIndices = async (): Promise<MarketIndex[]> => {
  const indicesPromises = MARKET_INDICES.map(index => 
    fetchMarketIndexData(index.symbol, index.name).then(data => ({...data, lastUpdated: new Date()}))
  );
  
  const results = await Promise.all(indicesPromises);
  // No longer need to filter for null, as fetchMarketIndexData always returns a MarketIndex
  return results;
};

// Start monitoring market indices in real-time
export const startMarketIndicesMonitoring = (
  onUpdate: (indices: MarketIndex[]) => void,
  refreshInterval = 60000 // Default 1 minute
) => {
  let isMounted = true; // To prevent updates after component unmounts

  const updateIndices = async () => {
    if (!isMounted) return;
    try {
      const indices = await fetchAllMarketIndices();
      if (isMounted) {
        onUpdate(indices);
      }
    } catch (error) {
      console.error("Error updating market indices:", error);
      // Optionally, could call onUpdate with an empty array or error state
      if (isMounted) {
        onUpdate([]); // Or pass error state if onUpdate handles it
      }
    }
  };
  
  // Initial update
  updateIndices();
  
  // Set up periodic updates
  const intervalId = setInterval(updateIndices, refreshInterval);
  
  // Return a function to stop monitoring
  return () => {
    isMounted = false;
    if (intervalId) {
      clearInterval(intervalId);
      console.log("Market indices monitoring stopped");
    }
  };
};
