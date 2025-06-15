
// Real-time gold rate service using API-only approach

import { executeQuery } from './db/dbConnector';

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
const API_BASE_URL = '/goldRates';

// Convert troy ounces to grams (1 troy oz = 31.1034768 grams)
const troyOunceToGram = (troyOunce: number): number => {
  return troyOunce / 31.1034768;
};

// Fetch gold rate from database or external API through backend
export const fetchGoldRate = async (currency = "INR"): Promise<GoldRate> => {
  try {
    // Get gold rate from our API which will either use the database
    // or fetch from an external API if necessary
    const goldRate = await executeQuery<GoldRate>(`${API_BASE_URL}?currency=${currency}`, 'GET');
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

// Save a new gold rate (for admin use)
export const saveGoldRate = async (goldRate: GoldRate): Promise<GoldRate> => {
  try {
    return await executeQuery<GoldRate>(API_BASE_URL, 'POST', goldRate);
  } catch (error) {
    console.error("Error saving gold rate:", error);
    throw new Error("Failed to save gold rate. Database connection required.");
  }
};

// Get historical gold rates
export const getHistoricalGoldRates = async (
  startDate: Date, 
  endDate: Date,
  currency = "INR"
): Promise<GoldRate[]> => {
  try {
    const url = `${API_BASE_URL}/history?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&currency=${currency}`;
    return await executeQuery<GoldRate[]>(url, 'GET');
  } catch (error) {
    console.error("Error fetching historical gold rates:", error);
    throw new Error("Failed to fetch historical gold rates. Database connection required.");
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

export const getGoldMetadata = async (): Promise<{ lastUpdated: Date | null; currency: string }> => {
  try {
    const goldRate = await fetchGoldRate();
    return {
      lastUpdated: goldRate.lastUpdated,
      currency: goldRate.currency
    };
  } catch (error) {
    console.error("Error fetching gold metadata:", error);
    return {
      lastUpdated: null,
      currency: "INR"
    };
  }
};
