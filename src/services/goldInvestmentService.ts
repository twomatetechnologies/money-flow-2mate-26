
import { v4 as uuidv4 } from 'uuid';
import { GoldInvestment } from '@/types';
import { createAuditRecord } from './auditService';

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

// CRUD operations for Gold Investments
export const createGold = (gold: Omit<GoldInvestment, 'id' | 'lastUpdated'>): GoldInvestment => {
  const newGold: GoldInvestment = {
    ...gold,
    id: uuidv4(),
    lastUpdated: new Date()
  };
  
  goldInvestments.push(newGold);
  saveGoldInvestments(goldInvestments);
  createAuditRecord(newGold.id, 'gold', 'create', newGold);
  return newGold;
};

export const updateGold = (id: string, updates: Partial<GoldInvestment>): GoldInvestment | null => {
  const index = goldInvestments.findIndex(gold => gold.id === id);
  if (index === -1) return null;
  
  const originalGold = { ...goldInvestments[index] };
  
  goldInvestments[index] = {
    ...goldInvestments[index],
    ...updates,
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

export const getGoldInvestments = (): Promise<GoldInvestment[]> => {
  return Promise.resolve(goldInvestments);
};
