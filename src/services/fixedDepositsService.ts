
import { v4 as uuidv4 } from 'uuid';
import { FixedDeposit } from '@/types';
import { createAuditRecord } from './auditService';

// In-memory datastore (in a real app, this would use a database)
let fixedDeposits: FixedDeposit[] = [];

export const getFixedDeposits = (): Promise<FixedDeposit[]> => {
  // Return a deep copy of the deposits to prevent accidental mutations
  return Promise.resolve(JSON.parse(JSON.stringify(fixedDeposits)));
};

export const addFixedDeposit = (deposit: Partial<FixedDeposit>): Promise<FixedDeposit> => {
  const newDeposit: FixedDeposit = {
    id: uuidv4(),
    bankName: deposit.bankName || '',
    accountNumber: deposit.accountNumber || '',
    principal: deposit.principal || 0,
    interestRate: deposit.interestRate || 0,
    startDate: deposit.startDate || new Date(),
    maturityDate: deposit.maturityDate || new Date(),
    maturityAmount: deposit.maturityAmount || 0,
    isAutoRenew: deposit.isAutoRenew || false,
    familyMemberId: deposit.familyMemberId || '',
    lastUpdated: new Date(),
  };
  
  fixedDeposits.push(newDeposit);
  createAuditRecord(newDeposit.id, 'fixedDeposit', 'create', newDeposit);
  return Promise.resolve(newDeposit);
};

export const updateFixedDeposit = (id: string, updates: Partial<FixedDeposit>): Promise<FixedDeposit> => {
  const index = fixedDeposits.findIndex(deposit => deposit.id === id);
  if (index === -1) {
    return Promise.reject(new Error('Fixed deposit not found'));
  }
  
  const originalDeposit = { ...fixedDeposits[index] };
  
  fixedDeposits[index] = {
    ...fixedDeposits[index],
    ...updates,
    lastUpdated: new Date()
  };
  
  createAuditRecord(id, 'fixedDeposit', 'update', {
    previous: originalDeposit,
    current: fixedDeposits[index],
    changes: updates
  });
  
  return Promise.resolve(fixedDeposits[index]);
};

export const deleteFixedDeposit = (id: string): Promise<void> => {
  const index = fixedDeposits.findIndex(deposit => deposit.id === id);
  if (index === -1) {
    return Promise.reject(new Error('Fixed deposit not found'));
  }
  
  const deletedDeposit = fixedDeposits[index];
  fixedDeposits.splice(index, 1);
  
  createAuditRecord(id, 'fixedDeposit', 'delete', deletedDeposit);
  return Promise.resolve();
};
