
/**
 * Fixed Deposit service for database operations
 */
import { v4 as uuidv4 } from 'uuid';
import { FixedDeposit } from '@/types';
import { executeQuery } from './dbConnector';
import { createAuditRecord } from '../auditService';

// Get all fixed deposits
export const getFixedDeposits = async (): Promise<FixedDeposit[]> => {
  try {
    const deposits = await executeQuery<FixedDeposit[]>('/fixed-deposits');
    
    // Convert date strings to Date objects
    return deposits.map(deposit => ({
      ...deposit,
      startDate: new Date(deposit.startDate),
      maturityDate: new Date(deposit.maturityDate),
      lastUpdated: new Date(deposit.lastUpdated)
    }));
  } catch (error) {
    console.error('Failed to fetch fixed deposits from database:', error);
    throw error;
  }
};

// Add a new fixed deposit
export const addFixedDeposit = async (deposit: Partial<FixedDeposit>): Promise<FixedDeposit> => {
  try {
    const newDeposit = {
      id: deposit.id || uuidv4(),
      bankName: deposit.bankName || '',
      accountNumber: deposit.accountNumber || '',
      principal: deposit.principal || 0,
      interestRate: deposit.interestRate || 0,
      startDate: deposit.startDate || new Date(),
      maturityDate: deposit.maturityDate || new Date(),
      maturityAmount: deposit.maturityAmount || 0,
      isAutoRenew: deposit.isAutoRenew || false,
      familyMemberId: deposit.familyMemberId || 'self-default', // Default to self if not provided
      notes: deposit.notes || '',
      lastUpdated: new Date(),
    };
    
    const savedDeposit = await executeQuery<FixedDeposit>('/fixed-deposits', 'POST', newDeposit);
    
    // Convert date strings to Date objects
    const result = {
      ...savedDeposit,
      startDate: new Date(savedDeposit.startDate),
      maturityDate: new Date(savedDeposit.maturityDate),
      lastUpdated: new Date(savedDeposit.lastUpdated)
    };
    
    createAuditRecord(result.id, 'fixedDeposit', 'create', result);
    return result;
  } catch (error) {
    console.error('Failed to add fixed deposit to database:', error);
    throw error;
  }
};

// Update an existing fixed deposit
export const updateFixedDeposit = async (id: string, updates: Partial<FixedDeposit>): Promise<FixedDeposit> => {
  try {
    const updatedData = {
      ...updates,
      lastUpdated: new Date()
    };
    
    const updatedDeposit = await executeQuery<FixedDeposit>(`/fixed-deposits/${id}`, 'PUT', updatedData);
    
    // Convert date strings to Date objects
    const result = {
      ...updatedDeposit,
      startDate: new Date(updatedDeposit.startDate),
      maturityDate: new Date(updatedDeposit.maturityDate),
      lastUpdated: new Date(updatedDeposit.lastUpdated)
    };
    
    createAuditRecord(id, 'fixedDeposit', 'update', {
      current: result,
      changes: updates
    });
    
    return result;
  } catch (error) {
    console.error(`Failed to update fixed deposit ${id} in database:`, error);
    throw error;
  }
};

// Delete a fixed deposit
export const deleteFixedDeposit = async (id: string): Promise<boolean> => {
  try {
    const response = await executeQuery<{success: boolean; message: string}>(`/fixed-deposits/${id}`, 'DELETE');
    if (response.success) {
      createAuditRecord(id, 'fixedDeposit', 'delete', { id });
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Failed to delete fixed deposit ${id} from database:`, error);
    throw error;
  }
};

// Get a single fixed deposit by ID
export const getFixedDepositById = async (id: string): Promise<FixedDeposit | null> => {
  try {
    const deposit = await executeQuery<FixedDeposit>(`/fixed-deposits/${id}`);
    
    // Convert date strings to Date objects
    return {
      ...deposit,
      startDate: new Date(deposit.startDate),
      maturityDate: new Date(deposit.maturityDate),
      lastUpdated: new Date(deposit.lastUpdated)
    };
  } catch (error) {
    console.error(`Failed to fetch fixed deposit ${id} from database:`, error);
    return null;
  }
};
