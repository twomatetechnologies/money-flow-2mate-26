
// Real-time gold rate service

interface GoldRateResponse {
  success: boolean;
  timestamp: number;
  base: string;
  rates: {
    XAU: number; // Gold rate in troy ounces
  };
  error?: string;
}

interface GoldRate {
  perGram: number;
  lastUpdated: Date;
  currency: string;
}

const API_KEY = "goldapi_sample_key"; // In a real application, this would be stored securely
const GOLD_RATE_STORAGE_KEY = "goldRates";
const UPDATE_INTERVAL = 60 * 60 * 1000; // 1 hour in milliseconds

// Cache gold rates in localStorage with timestamp
const saveGoldRate = (rate: GoldRate): void => {
  try {
    const data = {
      rate,
      timestamp: new Date().getTime()
    };
    localStorage.setItem(GOLD_RATE_STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Error saving gold rate to localStorage:", error);
  }
};

// Get cached gold rate if available and not expired
const getCachedGoldRate = (): GoldRate | null => {
  try {
    const data = localStorage.getItem(GOLD_RATE_STORAGE_KEY);
    if (!data) return null;
    
    const { rate, timestamp } = JSON.parse(data);
    const now = new Date().getTime();
    
    // Return cached rate if it's less than UPDATE_INTERVAL old
    if (now - timestamp < UPDATE_INTERVAL) {
      return rate;
    }
    
    return null;
  } catch (error) {
    console.error("Error reading cached gold rate:", error);
    return null;
  }
};

// Convert troy ounces to grams (1 troy oz = 31.1034768 grams)
const troyOunceToGram = (troyOunce: number): number => {
  return troyOunce / 31.1034768;
};

// Fetch gold rate from an API
export const fetchGoldRate = async (currency = "INR"): Promise<GoldRate> => {
  // Check for cached rate first
  const cachedRate = getCachedGoldRate();
  if (cachedRate) {
    return cachedRate;
  }
  
  // In a real application, we would use an actual API call:
  // Try using a mock implementation for now
  try {
    // Simulate API call with realistic values
    // In a real app, this would be:
    // const response = await fetch(`https://metals-api.com/api/latest?access_key=${API_KEY}&base=${currency}&symbols=XAU`);
    // const data: GoldRateResponse = await response.json();
    
    // Mock response
    const mockXauRate = 0.000042; // 1 INR = 0.000042 XAU (approximate)
    const goldRatePerOunce = 1 / mockXauRate; // INR per troy ounce
    const goldRatePerGram = troyOunceToGram(goldRatePerOunce);
    
    const goldRate: GoldRate = {
      perGram: Math.round(goldRatePerGram * 100) / 100, // Round to 2 decimal places
      lastUpdated: new Date(),
      currency
    };
    
    // Save to cache
    saveGoldRate(goldRate);
    return goldRate;
    
  } catch (error) {
    console.error("Error fetching gold rate:", error);
    
    // Return a fallback value if API call fails
    return {
      perGram: 5500, // Approximate INR value per gram as fallback
      lastUpdated: new Date(),
      currency
    };
  }
};

// Function to calculate current price based on market rate
export const calculateCurrentGoldPrice = async (
  type: string,
  purity: number = 99.9, // Default to 24K gold
  currency = "INR"
): Promise<number> => {
  const goldRate = await fetchGoldRate(currency);
  
  // Apply adjustments based on type and purity
  let priceMultiplier = 1.0;
  
  // Physical gold might have markup for making charges
  if (type === "Physical") {
    priceMultiplier = 1.05; // 5% markup for physical gold
  } 
  // Digital gold generally follows market price closely
  else if (type === "Digital") {
    priceMultiplier = 1.02; // 2% markup for digital gold
  }
  // ETFs can have slight discounts due to scale
  else if (type === "ETF") {
    priceMultiplier = 0.99; // 1% discount for ETFs
  } 
  // SGBs might have a discount due to government backing
  else if (type === "SGB") {
    priceMultiplier = 0.98; // 2% discount for sovereign gold bonds
  }
  
  // Apply purity adjustment (e.g., 22K gold is 91.6% pure compared to 24K)
  const purityAdjustment = purity / 99.9;
  
  // Calculate final price
  return goldRate.perGram * priceMultiplier * purityAdjustment;
};

export const getGoldMetadata = (): { lastUpdated: Date | null; currency: string } => {
  const cachedRate = getCachedGoldRate();
  return {
    lastUpdated: cachedRate?.lastUpdated || null,
    currency: cachedRate?.currency || "INR"
  };
};
