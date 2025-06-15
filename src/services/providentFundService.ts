import { v4 as uuidv4 } from 'uuid';
import { ProvidentFund } from '@/types';
import { createAuditRecord } from './auditService';
import { executeQuery } from './db/dbConnector';

// Get all provident funds
export const getProvidentFunds = async (): Promise<ProvidentFund[]> => {
  try {
    return await executeQuery<ProvidentFund[]>('/provident-funds');
  } catch (error) {
    console.error('Error fetching provident funds:', error);
    throw error;
  }
};

// Get a specific provident fund by ID
export const getProvidentFundById = async (id: string): Promise<ProvidentFund | null> => {
  try {
    return await executeQuery<ProvidentFund>(`/provident-funds/${id}`);
  } catch (error) {
    console.error(`Error fetching provident fund ${id}:`, error);
    throw error;
  }
};

// Create a new provident fund
export const createProvidentFund = async (pf: Partial<ProvidentFund>): Promise<ProvidentFund> => {
  try {
    const newPF = {
      ...pf,
      id: pf.id || `pf-${uuidv4()}`,
      lastUpdated: new Date(),
      startDate: pf.startDate || new Date()
    };
    
    const result = await executeQuery<ProvidentFund>('/provident-funds', 'POST', newPF);
    
    // Create audit record
    await createAuditRecord(
      result.id,
      'providentFund',
      'create',
      {
        accountNumber: result.accountNumber,
        type: result.type,
        balance: result.balance
      }
    );
    
    return result;
  } catch (error) {
    console.error('Error creating provident fund:', error);
    throw error;
  }
};

// Update an existing provident fund
export const updateProvidentFund = async (id: string, updates: Partial<ProvidentFund>): Promise<ProvidentFund | null> => {
  try {
    // Get the original PF for audit
    const originalPF = await getProvidentFundById(id);
    
    if (!originalPF) {
      throw new Error(`Provident fund with ID ${id} not found`);
    }
    
    // Include lastUpdated field
    const updatesWithTimestamp = {
      ...updates,
      lastUpdated: new Date()
    };
    
    const updatedPF = await executeQuery<ProvidentFund>(`/provident-funds/${id}`, 'PUT', updatesWithTimestamp);
    
    // Create audit record
    await createAuditRecord(
      id,
      'providentFund',
      'update',
      {
        original: originalPF,
        current: updatedPF,
        changes: Object.keys(updates)
      }
    );
    
    return updatedPF;
  } catch (error) {
    console.error(`Error updating provident fund ${id}:`, error);
    throw error;
  }
};

// Delete a provident fund
export const deleteProvidentFund = async (id: string): Promise<boolean> => {
  try {
    // Get the original PF for audit
    const originalPF = await getProvidentFundById(id);
    
    if (!originalPF) {
      throw new Error(`Provident fund with ID ${id} not found`);
    }
    
    await executeQuery(`/provident-funds/${id}`, 'DELETE');
    
    // Create audit record
    await createAuditRecord(
      id,
      'providentFund',
      'delete',
      { deleted: originalPF }
    );
    
    return true;
  } catch (error) {
    console.error(`Error deleting provident fund ${id}:`, error);
    throw error;
  }
};
