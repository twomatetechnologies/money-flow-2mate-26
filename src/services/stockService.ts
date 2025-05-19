
import { v4 as uuidv4 } from 'uuid';
import { StockHolding } from '@/types';
import { createAuditRecord } from './auditService';
import { isPostgresEnabled } from './db/dbConnector';
import * as stockDbService from './db/stockDbService';

const useDatabase = isPostgresEnabled();

// CRUD operations for Stocks
export const createStock = async (stock: Omit<StockHolding, 'id' | 'lastUpdated'>): Promise<StockHolding> => {
  if (useDatabase) {
    return await stockDbService.addStock(stock);
  }
  console.error('Database not enabled. createStock operation cannot persist.');
  // To prevent using mock data, we throw an error if the DB is not available for a create operation.
  throw new Error('Database is not enabled. Stock cannot be created.');
};

export const updateStock = async (id: string, updates: Partial<StockHolding>): Promise<StockHolding | null> => {
  if (useDatabase) {
    return await stockDbService.updateStock(id, updates);
  }
  console.error('Database not enabled. updateStock operation cannot persist.');
  throw new Error('Database is not enabled. Stock cannot be updated.');
};

export const deleteStock = async (id: string): Promise<boolean> => {
  if (useDatabase) {
    return await stockDbService.deleteStock(id);
  }
  console.error('Database not enabled. deleteStock operation cannot persist.');
  throw new Error('Database is not enabled. Stock cannot be deleted.');
};

export const getStockById = async (id: string): Promise<StockHolding | null> => {
  if (useDatabase) {
    return await stockDbService.getStockById(id);
  }
  // If DB is not enabled, no stock can be fetched by ID from a persistent source.
  console.warn('Database not enabled. getStockById will return null.');
  return null;
};

export const getStocks = async (): Promise<StockHolding[]> => {
  if (useDatabase) {
    return await stockDbService.getStocks();
  }
  // If PostgreSQL is not enabled, return an empty array.
  console.warn('Database not enabled. getStocks will return an empty array.');
  return Promise.resolve([]);
};

