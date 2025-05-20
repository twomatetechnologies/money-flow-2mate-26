/**
 * Provident Fund service for database operations
 */
import { v4 as uuidv4 } from 'uuid';
import { ProvidentFund } from '@/types';
import { executeQuery } from './dbConnector';
import { createAuditRecord } from '../auditService';

// Get all provident funds
export const getProvidentFunds = async (): Promise<ProvidentFund[]> => {
  try {
    const funds = await executeQuery<ProvidentFund[]>('/provident-funds');
    
    // Convert date strings to Date objects
    return funds.map(fund => ({
      ...fund,
      startDate: new Date(fund.startDate),
      lastUpdated: new Date(fund.lastUpdated)
    }));
  } catch (error) {
    console.error('Failed to fetch provident funds from database:', error);
    throw error;
  }
};

// Add a new provident fund
export const addProvidentFund = async (fund: Partial<ProvidentFund>): Promise<ProvidentFund> => {
  try {
    const newFund = {
      id: fund.id || uuidv4(),
      employerName: fund.employerName || '',
      accountNumber: fund.accountNumber || '',
      employeeContribution: fund.employeeContribution || 0,
      employerContribution: fund.employerContribution || 0,
      totalBalance: fund.totalBalance || 0,
      interestRate: fund.interestRate || 0,
      startDate: fund.startDate || new Date(),
      lastUpdated: new Date(),
      monthlyContribution: fund.monthlyContribution || 0,
      notes: fund.notes || '',
      familyMemberId: fund.familyMemberId || '',
    };
    
    const savedFund = await executeQuery<ProvidentFund>('/provident-funds', 'POST', newFund);
    
    // Convert date strings to Date objects
    const result = {
      ...savedFund,
      startDate: new Date(savedFund.startDate),
      lastUpdated: new Date(savedFund.lastUpdated)
    };
    
    createAuditRecord(result.id, 'providentFund', 'create', result);
    return result;
  } catch (error) {
    console.error('Failed to add provident fund to database:', error);
    throw error;
  }
};

// Update an existing provident fund
export const updateProvidentFund = async (id: string, updates: Partial<ProvidentFund>): Promise<ProvidentFund> => {
  try {
    const updatedData = {
      ...updates,
      lastUpdated: new Date()
    };
    
    const updatedFund = await executeQuery<ProvidentFund>(`/provident-funds/${id}`, 'PUT', updatedData);
    
    // Convert date strings to Date objects
    const result = {
      ...updatedFund,
      startDate: new Date(updatedFund.startDate),
      lastUpdated: new Date(updatedFund.lastUpdated)
    };
    
    createAuditRecord(id, 'providentFund', 'update', {
      current: result,
      changes: updates
    });
    
    return result;
  } catch (error) {
    console.error(`Failed to update provident fund ${id} in database:`, error);
    throw error;
  }
};

// Delete a provident fund
export const deleteProvidentFund = async (id: string): Promise<boolean> => {
  try {
    // Get the fund before deleting for audit record
    const fundToDelete = await getProvidentFundById(id);
    if (!fundToDelete) {
      throw new Error(`Provident fund ${id} not found`);
    }
    
    // Delete the fund
    const response = await executeQuery<{ success: boolean }>(`/provident-funds/${id}`, 'DELETE');
    
    if (!response.success) {
      throw new Error('Failed to delete provident fund');
    }
    
    // Create audit record after successful deletion
    await createAuditRecord(id, 'providentFund', 'delete', fundToDelete);
    return true;
  } catch (error) {
    console.error(`Failed to delete provident fund ${id} from database:`, error);
    throw error;
  }
};

// Get a single provident fund by ID
export const getProvidentFundById = async (id: string): Promise<ProvidentFund | null> => {
  try {
    const fund = await executeQuery<ProvidentFund>(`/provident-funds/${id}`);
    
    // Convert date strings to Date objects
    return {
      ...fund,
      startDate: new Date(fund.startDate),
      lastUpdated: new Date(fund.lastUpdated)
    };
  } catch (error) {
    console.error(`Failed to fetch provident fund ${id} from database:`, error);
    return null;
  }
};
