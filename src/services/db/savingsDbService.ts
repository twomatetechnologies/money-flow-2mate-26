/**
 * Savings Accounts service for database operations
 */
import { v4 as uuidv4 } from 'uuid';
import { SavingsAccount } from '@/types';
import { executeQuery } from './dbConnector';
import { createAuditRecord } from '../auditService';

// Get all savings accounts
export const getSavingsAccounts = async (): Promise<SavingsAccount[]> => {
  try {
    const accounts = await executeQuery<SavingsAccount[]>('/savings-accounts');
    
    // Convert date strings to Date objects
    return accounts.map(account => ({
      ...account,
      lastUpdated: new Date(account.lastUpdated)
    }));
  } catch (error) {
    console.error('Failed to fetch savings accounts from database:', error);
    throw error;
  }
};

// Add a new savings account
export const addSavingsAccount = async (account: Partial<SavingsAccount>): Promise<SavingsAccount> => {
  try {
    const newAccount = {
      id: account.id || uuidv4(),
      bankName: account.bankName || '',
      accountNumber: account.accountNumber || '',
      accountType: account.accountType || 'Savings',
      balance: account.balance || 0,
      interestRate: account.interestRate || 0,
      familyMemberId: account.familyMemberId || '',
      branchName: account.branchName || '',
      ifscCode: account.ifscCode || '',
      nominees: account.nominees || [],
      notes: account.notes || '',
      lastUpdated: new Date(),
    };
    
    const savedAccount = await executeQuery<SavingsAccount>('/savings-accounts', 'POST', newAccount);
    
    // Convert date strings to Date objects
    const result = {
      ...savedAccount,
      lastUpdated: new Date(savedAccount.lastUpdated)
    };
    
    createAuditRecord(result.id, 'savingsAccount', 'create', result);
    return result;
  } catch (error) {
    console.error('Failed to add savings account to database:', error);
    throw error;
  }
};

// Update an existing savings account
export const updateSavingsAccount = async (id: string, updates: Partial<SavingsAccount>): Promise<SavingsAccount> => {
  try {
    const updatedData = {
      ...updates,
      lastUpdated: new Date()
    };
    
    const updatedAccount = await executeQuery<SavingsAccount>(`/savings-accounts/${id}`, 'PUT', updatedData);
    
    // Convert date strings to Date objects
    const result = {
      ...updatedAccount,
      lastUpdated: new Date(updatedAccount.lastUpdated)
    };
    
    createAuditRecord(id, 'savingsAccount', 'update', {
      current: result,
      changes: updates
    });
    
    return result;
  } catch (error) {
    console.error(`Failed to update savings account ${id} in database:`, error);
    throw error;
  }
};

// Delete a savings account
export const deleteSavingsAccount = async (id: string): Promise<boolean> => {
  try {
    // Get the account before deleting for audit record
    const accountToDelete = await getSavingsAccountById(id);
    
    if (!accountToDelete) {
      throw new Error(`Savings account ${id} not found`);
    }
    
    // Delete the account
    const response = await executeQuery<{ success: boolean }>(`/savings-accounts/${id}`, 'DELETE');
    
    if (!response.success) {
      throw new Error('Failed to delete savings account');
    }
    
    // Create audit record after successful deletion
    await createAuditRecord(id, 'savingsAccount', 'delete', accountToDelete);
    return true;
  } catch (error) {
    console.error(`Failed to delete savings account ${id} from database:`, error);
    throw error;
  }
};

// Get a single savings account by ID
export const getSavingsAccountById = async (id: string): Promise<SavingsAccount | null> => {
  try {
    const account = await executeQuery<SavingsAccount>(`/savings-accounts/${id}`);
    
    // Convert date strings to Date objects
    return {
      ...account,
      lastUpdated: new Date(account.lastUpdated)
    };
  } catch (error) {
    console.error(`Failed to fetch savings account ${id} from database:`, error);
    return null;
  }
};
