
/**
 * Stock service for database operations
 */
import { v4 as uuidv4 } from 'uuid';
import { StockHolding } from '@/types';
import { executeQuery } from './dbConnector';
import { createAuditRecord } from '../auditService';

// Get all stocks
export const getStocks = async (): Promise<StockHolding[]> => {
  try {
    const stocks = await executeQuery<StockHolding[]>('/stocks');
    
    // Convert date strings to Date objects
    return stocks.map(stock => ({
      ...stock,
      lastUpdated: new Date(stock.lastUpdated)
    }));
  } catch (error) {
    console.error('Failed to fetch stocks from database:', error);
    throw error;
  }
};

// Add a new stock
export const addStock = async (stock: Partial<StockHolding>): Promise<StockHolding> => {
  try {
    // Validate required fields
    if (!stock.symbol || !stock.name || !stock.quantity || !stock.averageBuyPrice) {
      throw new Error('Missing required fields: symbol, name, quantity, averageBuyPrice');
    }
    
    const newStock = {
      id: stock.id || uuidv4(),
      symbol: stock.symbol,
      name: stock.name,
      quantity: stock.quantity,
      averageBuyPrice: stock.averageBuyPrice,
      currentPrice: stock.currentPrice || stock.averageBuyPrice,
      change: stock.change || 0,
      changePercent: stock.changePercent || 0,
      value: stock.value || (stock.quantity * (stock.currentPrice || stock.averageBuyPrice)),
      sector: stock.sector || 'Unspecified',
      familyMemberId: stock.familyMemberId || '',
      lastUpdated: new Date(),
    };
    
    const savedStock = await executeQuery<StockHolding>('/stocks', 'POST', newStock);
    
    // Convert date strings to Date objects
    const result = {
      ...savedStock,
      lastUpdated: new Date(savedStock.lastUpdated)
    };
    
    createAuditRecord(result.id, 'stock', 'create', result);
    return result;
  } catch (error) {
    console.error('Failed to add stock to database:', error);
    throw error;
  }
};

// Update an existing stock
export const updateStock = async (id: string, updates: Partial<StockHolding>): Promise<StockHolding> => {
  try {
    const updatedData = {
      ...updates,
      lastUpdated: new Date()
    };
    
    const updatedStock = await executeQuery<StockHolding>(`/stocks/${id}`, 'PUT', updatedData);
    
    // Convert date strings to Date objects
    const result = {
      ...updatedStock,
      lastUpdated: new Date(updatedStock.lastUpdated)
    };
    
    createAuditRecord(id, 'stock', 'update', {
      current: result,
      changes: updates
    });
    
    return result;
  } catch (error) {
    console.error(`Failed to update stock ${id} in database:`, error);
    throw error;
  }
};

// Delete a stock
export const deleteStock = async (id: string): Promise<boolean> => {
  try {
    await executeQuery(`/stocks/${id}`, 'DELETE');
    createAuditRecord(id, 'stock', 'delete', { id });
    return true;
  } catch (error) {
    console.error(`Failed to delete stock ${id} from database:`, error);
    throw error;
  }
};

// Get a single stock by ID
export const getStockById = async (id: string): Promise<StockHolding | null> => {
  try {
    const stock = await executeQuery<StockHolding>(`/stocks/${id}`);
    
    // Convert date strings to Date objects
    return {
      ...stock,
      lastUpdated: new Date(stock.lastUpdated)
    };
  } catch (error) {
    console.error(`Failed to fetch stock ${id} from database:`, error);
    return null;
  }
};
