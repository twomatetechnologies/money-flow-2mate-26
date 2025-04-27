
import { v4 as uuidv4 } from 'uuid';
import { StockHolding } from '@/types';
import { createAuditRecord } from './auditService';

const STOCKS_STORAGE_KEY = 'stocks';

// Load stocks from localStorage
const loadStocks = (): StockHolding[] => {
  try {
    const stored = localStorage.getItem(STOCKS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading stocks:', error);
    return [];
  }
};

// Save stocks to localStorage
const saveStocks = (stocks: StockHolding[]): void => {
  try {
    localStorage.setItem(STOCKS_STORAGE_KEY, JSON.stringify(stocks));
  } catch (error) {
    console.error('Error saving stocks:', error);
  }
};

// In-memory datastore with persistence
let stocks = loadStocks();

// CRUD operations for Stocks
export const createStock = (stock: Omit<StockHolding, 'id' | 'lastUpdated'>): StockHolding => {
  const newStock: StockHolding = {
    ...stock,
    id: uuidv4(),
    lastUpdated: new Date()
  };
  
  stocks.push(newStock);
  saveStocks(stocks);
  createAuditRecord(newStock.id, 'stock', 'create', newStock);
  return newStock;
};

export const updateStock = (id: string, updates: Partial<StockHolding>): StockHolding | null => {
  const index = stocks.findIndex(stock => stock.id === id);
  if (index === -1) return null;
  
  // Get the original stock for audit purposes
  const originalStock = { ...stocks[index] };
  
  // Update the stock
  stocks[index] = {
    ...stocks[index],
    ...updates,
    lastUpdated: new Date()
  };
  
  saveStocks(stocks);
  createAuditRecord(id, 'stock', 'update', {
    previous: originalStock,
    current: stocks[index],
    changes: updates
  });
  
  return stocks[index];
};

export const deleteStock = (id: string): boolean => {
  const index = stocks.findIndex(stock => stock.id === id);
  if (index === -1) return false;
  
  const deletedStock = stocks[index];
  stocks.splice(index, 1);
  
  saveStocks(stocks);
  createAuditRecord(id, 'stock', 'delete', deletedStock);
  return true;
};

export const getStockById = (id: string): StockHolding | null => {
  return stocks.find(stock => stock.id === id) || null;
};

export const getStocks = (): Promise<StockHolding[]> => {
  return Promise.resolve(stocks);
};
