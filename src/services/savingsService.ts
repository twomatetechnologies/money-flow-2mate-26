
import { v4 as uuidv4 } from 'uuid';
import { SavingsAccount } from '@/types';
import { createAuditRecord } from './auditService';

// In-memory datastore (in a real app, this would use a database)
let savingsAccounts: SavingsAccount[] = [];

export const getSavingsAccounts = (): Promise<SavingsAccount[]> => {
  // Return a deep copy of the savings accounts to prevent accidental mutations
  return Promise.resolve(JSON.parse(JSON.stringify(savingsAccounts)));
};

export const addSavingsAccount = (account: Partial<SavingsAccount>): Promise<SavingsAccount> => {
  const newAccount: SavingsAccount = {
    id: uuidv4(),
    bankName: account.bankName || '',
    accountNumber: account.accountNumber || '',
    accountType: account.accountType as SavingsAccount['accountType'] || 'Savings',
    balance: account.balance || 0,
    interestRate: account.interestRate || 0,
    familyMemberId: account.familyMemberId || '',
    isJointAccount: account.isJointAccount || false,
    jointHolderName: account.jointHolderName || '',
    lastUpdated: new Date(),
  };
  
  savingsAccounts.push(newAccount);
  createAuditRecord(newAccount.id, 'savingsAccount', 'create', newAccount);
  return Promise.resolve(newAccount);
};

export const updateSavingsAccount = (id: string, updates: Partial<SavingsAccount>): Promise<SavingsAccount> => {
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
  
  createAuditRecord(id, 'savingsAccount', 'update', {
    previous: originalAccount,
    current: savingsAccounts[index],
    changes: updates
  });
  
  return Promise.resolve(savingsAccounts[index]);
};

export const deleteSavingsAccount = (id: string): Promise<void> => {
  const index = savingsAccounts.findIndex(account => account.id === id);
  if (index === -1) {
    return Promise.reject(new Error('Savings account not found'));
  }
  
  const deletedAccount = savingsAccounts[index];
  savingsAccounts.splice(index, 1);
  
  createAuditRecord(id, 'savingsAccount', 'delete', deletedAccount);
  return Promise.resolve();
};
