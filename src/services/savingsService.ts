import { v4 as uuidv4 } from 'uuid';
import { SavingsAccount } from '@/types';
import { createAuditRecord } from './auditService';
import { isPostgresEnabled } from './db/dbConnector';
import * as savingsDbService from './db/savingsDbService';

const SAVINGS_STORAGE_KEY = 'savingsAccounts';

// Load savings accounts from localStorage
const loadSavingsAccounts = (): SavingsAccount[] => {
  try {
    const stored = localStorage.getItem(SAVINGS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading savings accounts:', error);
    return [];
  }
};

// Save savings accounts to localStorage
const saveSavingsAccounts = (accounts: SavingsAccount[]): void => {
  try {
    localStorage.setItem(SAVINGS_STORAGE_KEY, JSON.stringify(accounts));
  } catch (error) {
    console.error('Error saving savings accounts:', error);
  }
};

// In-memory datastore with persistence
let savingsAccounts = loadSavingsAccounts();

// Check if we should use database operations
const useDatabase = isPostgresEnabled();

// Get all savings accounts
export const getSavingsAccounts = async (): Promise<SavingsAccount[]> => {
  if (useDatabase) {
    return await savingsDbService.getSavingsAccounts();
  }
  
  return Promise.resolve([...savingsAccounts]);
};

// Add a new savings account
export const addSavingsAccount = async (account: Partial<SavingsAccount>): Promise<SavingsAccount> => {
  if (useDatabase) {
    return await savingsDbService.addSavingsAccount(account);
  }
  
  const newAccount: SavingsAccount = {
    id: uuidv4(),
    bankName: account.bankName || '',
    accountNumber: account.accountNumber || '',
    accountType: account.accountType as SavingsAccount['accountType'] || 'Savings',
    balance: account.balance || 0,
    interestRate: account.interestRate || 0,
    familyMemberId: account.familyMemberId || '',
    branchName: account.branchName || '',
    ifscCode: account.ifscCode || '',
    nominees: account.nominees || [],
    notes: account.notes || '',
    lastUpdated: new Date(),
  };
  
  savingsAccounts.push(newAccount);
  saveSavingsAccounts(savingsAccounts);
  createAuditRecord(newAccount.id, 'savingsAccount', 'create', newAccount);
  return Promise.resolve(newAccount);
};

// Update a savings account
export const updateSavingsAccount = async (id: string, updates: Partial<SavingsAccount>): Promise<SavingsAccount> => {
  if (useDatabase) {
    return await savingsDbService.updateSavingsAccount(id, updates);
  }
  
  const index = savingsAccounts.findIndex(account => account.id === id);
  if (index === -1) {
    return Promise.reject(new Error('Savings account not found'));
  }
  
  const originalAccount = { ...savingsAccounts[index] };
  
  savingsAccounts[index] = {
    ...savingsAccounts[index],
    ...updates,
    lastUpdated: new Date()
  };
  
  saveSavingsAccounts(savingsAccounts);
  createAuditRecord(id, 'savingsAccount', 'update', {
    previous: originalAccount,
    current: savingsAccounts[index],
    changes: updates
  });
  
  return Promise.resolve(savingsAccounts[index]);
};

// Delete a savings account
export const deleteSavingsAccount = async (id: string): Promise<void> => {
  if (useDatabase) {
    const response = await savingsDbService.deleteSavingsAccount(id);
    if (!response) {
      throw new Error('Failed to delete savings account');
    }
    return;
  }
  
  const index = savingsAccounts.findIndex(account => account.id === id);
  if (index === -1) {
    return Promise.reject(new Error('Savings account not found'));
  }
  
  const deletedAccount = { ...savingsAccounts[index] };
  savingsAccounts.splice(index, 1);
  saveSavingsAccounts(savingsAccounts);
  
  // Create audit record after successful deletion
  await createAuditRecord(id, 'savingsAccount', 'delete', deletedAccount);
  return Promise.resolve();
};
