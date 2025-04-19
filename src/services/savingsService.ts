
import { v4 as uuidv4 } from 'uuid';
import { SavingsAccount } from '@/types';
import { createAuditRecord } from './auditService';

// In-memory datastore (in a real app, this would use a database)
let savingsAccounts: SavingsAccount[] = [];

export const getSavingsAccounts = (): Promise<SavingsAccount[]> => {
  // Return a deep copy of the accounts to prevent accidental mutations
  return Promise.resolve(JSON.parse(JSON.stringify(savingsAccounts)));
};

export const createSavingsAccount = (account: Omit<SavingsAccount, 'id' | 'lastUpdated'>): SavingsAccount => {
  const newAccount: SavingsAccount = {
    ...account,
    id: uuidv4(),
    lastUpdated: new Date()
  };
  
  savingsAccounts.push(newAccount);
  createAuditRecord(newAccount.id, 'savingsAccount', 'create', newAccount);
  return newAccount;
};

export const updateSavingsAccount = (id: string, updates: Partial<SavingsAccount>): SavingsAccount | null => {
  const index = savingsAccounts.findIndex(account => account.id === id);
  if (index === -1) return null;
  
  const originalAccount = { ...savingsAccounts[index] };
  
  savingsAccounts[index] = {
    ...savingsAccounts[index],
    ...updates,
    lastUpdated: new Date()
  };
  
  createAuditRecord(id, 'savingsAccount', 'update', {
    previous: originalAccount,
    current: savingsAccounts[index],
    changes: updates
  });
  
  return savingsAccounts[index];
};

export const deleteSavingsAccount = (id: string): boolean => {
  const index = savingsAccounts.findIndex(account => account.id === id);
  if (index === -1) return false;
  
  const deletedAccount = savingsAccounts[index];
  savingsAccounts.splice(index, 1);
  
  createAuditRecord(id, 'savingsAccount', 'delete', deletedAccount);
  return true;
};

export const getSavingsAccountById = (id: string): SavingsAccount | null => {
  const account = savingsAccounts.find(account => account.id === id);
  return account ? JSON.parse(JSON.stringify(account)) : null;
};
