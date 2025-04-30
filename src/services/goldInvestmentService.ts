
import { v4 as uuidv4 } from 'uuid';
import { GoldInvestment } from '@/types';
import { createAuditRecord } from './auditService';
import { calculateCurrentGoldPrice } from './goldRateService';

const GOLD_STORAGE_KEY = 'goldInvestments';

// Load gold investments from localStorage
const loadGoldInvestments = (): GoldInvestment[] => {
  try {
    const stored = localStorage.getItem(GOLD_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading gold investments:', error);
    return [];
  }
};

// Save gold investments to localStorage
const saveGoldInvestments = (investments: GoldInvestment[]): void => {
  try {
    localStorage.setItem(GOLD_STORAGE_KEY, JSON.stringify(investments));
  } catch (error) {
    console.error('Error saving gold investments:', error);
  }
};

// In-memory datastore with persistence
let goldInvestments = loadGoldInvestments();

// Update gold price based on current market rate
export const updateGoldPrices = async (): Promise<GoldInvestment[]> => {
  const updatedInvestments = await Promise.all(
    goldInvestments.map(async (investment) => {
      // Calculate current market price based on gold type
      const currentPrice = await calculateCurrentGoldPrice(investment.type);
      
      // Update the current price and value
      return {
        ...investment,
        currentPrice,
        value: currentPrice * investment.quantity,
        lastUpdated: new Date()
      };
    })
  );
  
  // Update in-memory store and persist
  goldInvestments = updatedInvestments;
  saveGoldInvestments(goldInvestments);
  
  return updatedInvestments;
};

// CRUD operations for Gold Investments
export const createGold = async (gold: Omit<GoldInvestment, 'id' | 'lastUpdated'>): Promise<GoldInvestment> => {
  // Get current price based on gold type
  const currentPrice = await calculateCurrentGoldPrice(gold.type);
  
  const newGold: GoldInvestment = {
    ...gold,
    id: uuidv4(),
    currentPrice,
    value: currentPrice * gold.quantity,
    lastUpdated: new Date()
  };
  
  goldInvestments.push(newGold);
  saveGoldInvestments(goldInvestments);
  createAuditRecord(newGold.id, 'gold', 'create', newGold);
  return newGold;
};

export const updateGold = async (id: string, updates: Partial<GoldInvestment>): Promise<GoldInvestment | null> => {
  const index = goldInvestments.findIndex(gold => gold.id === id);
  if (index === -1) return null;
  
  const originalGold = { ...goldInvestments[index] };
  
  // If type has changed or we're forcing a price update, recalculate the current price
  let currentPrice = originalGold.currentPrice;
  if (updates.type || updates.forceUpdatePrice) {
    currentPrice = await calculateCurrentGoldPrice(updates.type || originalGold.type);
  }
  
  // Calculate the new quantity (if provided in updates)
  const quantity = updates.quantity !== undefined ? updates.quantity : originalGold.quantity;
  
  goldInvestments[index] = {
    ...goldInvestments[index],
    ...updates,
    currentPrice,
    value: currentPrice * quantity,
    lastUpdated: new Date()
  };
  
  saveGoldInvestments(goldInvestments);
  createAuditRecord(id, 'gold', 'update', {
    previous: originalGold,
    current: goldInvestments[index],
    changes: updates
  });
  
  return goldInvestments[index];
};

export const deleteGold = (id: string): boolean => {
  const index = goldInvestments.findIndex(gold => gold.id === id);
  if (index === -1) return false;
  
  const deletedGold = goldInvestments[index];
  goldInvestments.splice(index, 1);
  
  saveGoldInvestments(goldInvestments);
  createAuditRecord(id, 'gold', 'delete', deletedGold);
  return true;
};

export const getGoldById = (id: string): GoldInvestment | null => {
  return goldInvestments.find(gold => gold.id === id) || null;
};

export const getGoldInvestments = async (): Promise<GoldInvestment[]> => {
  // Update all gold prices to current market rates when fetching all investments
  await updateGoldPrices();
  return goldInvestments;
};
