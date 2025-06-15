import { executeQuery } from './db/dbConnector';
import { createAuditRecord } from './auditService';

// Define the SavingsAccount type interface
interface SavingsAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountType: 'Savings' | 'Current' | 'Salary' | 'Fixed Deposit' | 'Other';
  balance: number;
  interestRate: number;
  familyMemberId: string;
  branchName?: string;
  ifscCode?: string;
  nominees?: string[];
  notes?: string;
  lastUpdated: Date;
}

const API_BASE_URL = '/savingsAccounts';

// Get all savings accounts - PostgreSQL only
export const getSavingsAccounts = async (): Promise<SavingsAccount[]> => {
  try {
    return await executeQuery<SavingsAccount[]>(API_BASE_URL, 'GET');
  } catch (error) {
    console.error('Error fetching savings accounts:', error);
    throw new Error('Failed to fetch savings accounts. Database connection required.');
  }
};

// Add a new savings account - PostgreSQL only
export const addSavingsAccount = async (account: Partial<SavingsAccount>): Promise<SavingsAccount> => {
  try {
    const newAccount = await executeQuery<SavingsAccount>(API_BASE_URL, 'POST', account);
    createAuditRecord(newAccount.id, 'savingsAccount', 'create', newAccount);
    return newAccount;
  } catch (error) {
    console.error('Error creating savings account:', error);
    throw new Error('Failed to create savings account. Database connection required.');
  }
};

// Update a savings account - PostgreSQL only
export const updateSavingsAccount = async (id: string, updates: Partial<SavingsAccount>): Promise<SavingsAccount> => {
  try {
    const updatedAccount = await executeQuery<SavingsAccount>(`${API_BASE_URL}/${id}`, 'PUT', updates);
    createAuditRecord(id, 'savingsAccount', 'update', {
      current: updatedAccount,
      changes: updates
    });
    return updatedAccount;
  } catch (error) {
    console.error(`Error updating savings account ${id}:`, error);
    throw new Error(`Failed to update savings account. Database connection required.`);
  }
};

// Delete a savings account - PostgreSQL only
export const deleteSavingsAccount = async (id: string): Promise<boolean> => {
  try {
    await executeQuery<{ success: boolean }>(`${API_BASE_URL}/${id}`, 'DELETE');
    createAuditRecord(id, 'savingsAccount', 'delete', { id });
    return true;
  } catch (error) {
    console.error(`Error deleting savings account ${id}:`, error);
    throw new Error(`Failed to delete savings account. Database connection required.`);
  }
};

// Get a savings account by ID - PostgreSQL only
export const getSavingsAccountById = async (id: string): Promise<SavingsAccount | null> => {
  try {
    return await executeQuery<SavingsAccount | null>(`${API_BASE_URL}/${id}`, 'GET');
  } catch (error) {
    console.error(`Error fetching savings account ${id}:`, error);
    throw new Error(`Failed to fetch savings account. Database connection required.`);
  }
};
