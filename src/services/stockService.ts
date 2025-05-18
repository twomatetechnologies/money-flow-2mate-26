
import { v4 as uuidv4 } from 'uuid';
import { StockHolding } from '@/types';
import { createAuditRecord } from './auditService';
import { isPostgresEnabled } from './db/dbConnector';
import * as stockDbService from './db/stockDbService';

const STOCKS_STORAGE_KEY = 'stocks';

// Load stocks from localStorage
const loadStocks = (): StockHolding[] => {
  try {
    const stored = localStorage.getItem(STOCKS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    } else {
      // Create sample data if none exists
      return createSampleStocks();
    }
  } catch (error) {
    console.error('Error loading stocks:', error);
    return createSampleStocks();
  }
};

// Create sample stock data for visualization
const createSampleStocks = (): StockHolding[] => {
  const sampleStocks: StockHolding[] = [
    {
      id: uuidv4(),
      symbol: 'RELIANCE',
      name: 'Reliance Industries',
      quantity: 50,
      averageBuyPrice: 2400,
      currentPrice: 2580,
      change: 35,
      changePercent: 1.37,
      value: 129000,
      sector: 'Energy',
      lastUpdated: new Date(),
      familyMemberId: 'self-default'
    },
    {
      id: uuidv4(),
      symbol: 'INFY',
      name: 'Infosys',
      quantity: 100,
      averageBuyPrice: 1500,
      currentPrice: 1420,
      change: -28,
      changePercent: -1.93,
      value: 142000,
      sector: 'Technology',
      lastUpdated: new Date(),
      familyMemberId: 'spouse-default'
    },
    {
      id: uuidv4(),
      symbol: 'HDFCBANK',
      name: 'HDFC Bank',
      quantity: 75,
      averageBuyPrice: 1650,
      currentPrice: 1720,
      change: 12,
      changePercent: 0.7,
      value: 129000,
      sector: 'Banking',
      lastUpdated: new Date(),
      familyMemberId: 'self-default'
    }
  ];
  
  // Save the sample stocks to localStorage
  localStorage.setItem(STOCKS_STORAGE_KEY, JSON.stringify(sampleStocks));
  return sampleStocks;
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

// Check if we should use database operations
const useDatabase = isPostgresEnabled();

// CRUD operations for Stocks
export const createStock = async (stock: Omit<StockHolding, 'id' | 'lastUpdated'>): Promise<StockHolding> => {
  if (useDatabase) {
    return await stockDbService.addStock(stock);
  }
  
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

export const updateStock = async (id: string, updates: Partial<StockHolding>): Promise<StockHolding | null> => {
  if (useDatabase) {
    return await stockDbService.updateStock(id, updates);
  }
  
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

export const deleteStock = async (id: string): Promise<boolean> => {
  if (useDatabase) {
    return await stockDbService.deleteStock(id);
  }
  
  const index = stocks.findIndex(stock => stock.id === id);
  if (index === -1) return false;
  
  const deletedStock = stocks[index];
  stocks.splice(index, 1);
  
  saveStocks(stocks);
  createAuditRecord(id, 'stock', 'delete', deletedStock);
  return true;
};

export const getStockById = async (id: string): Promise<StockHolding | null> => {
  if (useDatabase) {
    return await stockDbService.getStockById(id);
  }
  
  return stocks.find(stock => stock.id === id) || null;
};

export const getStocks = async (): Promise<StockHolding[]> => {
  if (useDatabase) {
    return await stockDbService.getStocks();
  }
  // If PostgreSQL is not enabled, return an empty array as per user request.
  return Promise.resolve([]);
};

