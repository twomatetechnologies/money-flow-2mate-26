import { executeQuery } from './db/dbConnector';
import { createAuditRecord } from './auditService';
import { calculateCurrentGoldPrice } from './goldRateService';

// Define the GoldInvestment interface
interface GoldInvestment {
  id: string;
  name: string;
  type: string;
  purity: number;
  quantity: number;
  purchaseDate: Date;
  purchasePrice: number;
  currentPrice: number;
  value: number;
  location: string;
  notes?: string;
  familyMemberId: string;
  lastUpdated: Date;
}

const API_BASE_URL = '/goldInvestments';

// CRUD operations for Gold Investments - PostgreSQL only
export const createGold = async (investment: Partial<GoldInvestment>): Promise<GoldInvestment> => {
  try {
    // Set current price if not provided
    if (!investment.currentPrice && investment.type) {
      investment.currentPrice = await calculateCurrentGoldPrice(
        investment.type,
        investment.purity
      );
    }
    
    // Calculate value if quantity and currentPrice are available
    if (investment.quantity && investment.currentPrice && !investment.value) {
      investment.value = investment.quantity * investment.currentPrice;
    }
    
    const newInvestment = await executeQuery<GoldInvestment>(API_BASE_URL, 'POST', investment);
    createAuditRecord(newInvestment.id, 'gold', 'create', newInvestment);
    return newInvestment;
  } catch (error) {
    console.error('Error creating gold investment:', error);
    throw new Error('Failed to create gold investment. Database connection required.');
  }
};

export const updateGold = async (id: string, updates: Partial<GoldInvestment>): Promise<GoldInvestment | null> => {
  try {
    // Set current price if not provided but type is being updated
    if (!updates.currentPrice && updates.type) {
      updates.currentPrice = await calculateCurrentGoldPrice(
        updates.type,
        updates.purity
      );
    }
    
    // Recalculate value if quantity or currentPrice is updated
    if ((updates.quantity || updates.currentPrice) && !updates.value) {
      // Need to get the current investment to have the complete data for calculation
      const currentInvestment = await getGoldById(id);
      if (currentInvestment) {
        const quantity = updates.quantity ?? currentInvestment.quantity;
        const currentPrice = updates.currentPrice ?? currentInvestment.currentPrice;
        updates.value = quantity * currentPrice;
      }
    }
    
    const updatedInvestment = await executeQuery<GoldInvestment>(`${API_BASE_URL}/${id}`, 'PUT', updates);
    createAuditRecord(id, 'gold', 'update', {
      current: updatedInvestment,
      changes: updates
    });
    return updatedInvestment;
  } catch (error) {
    console.error(`Error updating gold investment ${id}:`, error);
    throw new Error(`Failed to update gold investment. Database connection required.`);
  }
};

export const deleteGold = async (id: string): Promise<boolean> => {
  try {
    await executeQuery<{ success: boolean }>(`${API_BASE_URL}/${id}`, 'DELETE');
    createAuditRecord(id, 'gold', 'delete', { id });
    return true;
  } catch (error) {
    console.error(`Error deleting gold investment ${id}:`, error);
    throw new Error(`Failed to delete gold investment. Database connection required.`);
  }
};

export const getGoldById = async (id: string): Promise<GoldInvestment | null> => {
  try {
    return await executeQuery<GoldInvestment | null>(`${API_BASE_URL}/${id}`, 'GET');
  } catch (error) {
    console.error(`Error fetching gold investment ${id}:`, error);
    throw new Error(`Failed to fetch gold investment. Database connection required.`);
  }
};

export const getGoldInvestments = async (): Promise<GoldInvestment[]> => {
  try {
    return await executeQuery<GoldInvestment[]>(API_BASE_URL, 'GET');
  } catch (error) {
    console.error('Error fetching gold investments:', error);
    throw new Error('Failed to fetch gold investments. Database connection required.');
  }
};

// Update gold prices based on current market rate
export const updateGoldPrices = async (): Promise<GoldInvestment[]> => {
  try {
    // This endpoint should update all gold investment prices in the database
    return await executeQuery<GoldInvestment[]>(`${API_BASE_URL}/update-prices`, 'POST');
  } catch (error) {
    console.error('Error updating gold prices:', error);
    throw new Error('Failed to update gold prices. Database connection required.');
  }
};

// Alias for compatibility with existing code
export const createGoldInvestment = createGold;
export const updateGoldInvestment = updateGold;
export const deleteGoldInvestment = deleteGold;
export const getGoldInvestmentById = getGoldById;
