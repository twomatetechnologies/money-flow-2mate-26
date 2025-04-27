
import { v4 as uuidv4 } from 'uuid';
import { FixedDeposit } from '@/types';
import { createAuditRecord } from './auditService';

const FD_STORAGE_KEY = 'fixedDeposits';

// Load fixed deposits from localStorage
const loadFixedDeposits = (): FixedDeposit[] => {
  try {
    const stored = localStorage.getItem(FD_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading fixed deposits:', error);
    return [];
  }
};

// Save fixed deposits to localStorage
const saveFixedDeposits = (deposits: FixedDeposit[]): void => {
  try {
    localStorage.setItem(FD_STORAGE_KEY, JSON.stringify(deposits));
  } catch (error) {
    console.error('Error saving fixed deposits:', error);
  }
};

// In-memory datastore with persistence
let fixedDeposits = loadFixedDeposits();

// Create a sample deposit if none exist
if (fixedDeposits.length === 0) {
  const startDate = new Date();
  const maturityDate = new Date();
  maturityDate.setDate(maturityDate.getDate() + 365); // 1 year maturity
  
  const sampleFD: FixedDeposit = {
    id: uuidv4(),
    bankName: 'HDFC',
    accountNumber: 'FD123456789',
    principal: 100000,
    interestRate: 6.5,
    startDate: startDate,
    maturityDate: maturityDate,
    maturityAmount: 106500, // Simple interest calculation
    isAutoRenew: false,
    notes: 'Sample fixed deposit',
    familyMemberId: 'self-default',
    lastUpdated: new Date()
  };
  
  fixedDeposits.push(sampleFD);
  saveFixedDeposits(fixedDeposits);
}

// CRUD operations for Fixed Deposits
export const createFixedDeposit = (fd: Partial<FixedDeposit>): FixedDeposit => {
  // Set default values for any missing required fields
  const newFD: FixedDeposit = {
    bankName: fd.bankName || 'Unknown Bank',
    accountNumber: fd.accountNumber || 'XXXX' + Math.floor(Math.random() * 10000),
    principal: fd.principal || 0,
    interestRate: fd.interestRate || 0,
    startDate: fd.startDate || new Date(),
    maturityDate: fd.maturityDate || new Date(),
    maturityAmount: fd.maturityAmount || 0,
    isAutoRenew: fd.isAutoRenew || false,
    notes: fd.notes || '',
    familyMemberId: fd.familyMemberId || 'self-default',
    id: uuidv4(),
    lastUpdated: new Date()
  };
  
  fixedDeposits.push(newFD);
  saveFixedDeposits(fixedDeposits);
  createAuditRecord(newFD.id, 'fixedDeposit', 'create', newFD);
  return newFD;
};

export const updateFixedDeposit = (id: string, updates: Partial<FixedDeposit>): FixedDeposit | null => {
  const index = fixedDeposits.findIndex(fd => fd.id === id);
  if (index === -1) return null;
  
  const originalFD = { ...fixedDeposits[index] };
  
  fixedDeposits[index] = {
    ...fixedDeposits[index],
    ...updates,
    lastUpdated: new Date()
  };
  
  saveFixedDeposits(fixedDeposits);
  createAuditRecord(id, 'fixedDeposit', 'update', {
    previous: originalFD,
    current: fixedDeposits[index],
    changes: updates
  });
  
  return fixedDeposits[index];
};

export const deleteFixedDeposit = (id: string): boolean => {
  const index = fixedDeposits.findIndex(fd => fd.id === id);
  if (index === -1) return false;
  
  const deletedFD = fixedDeposits[index];
  fixedDeposits.splice(index, 1);
  
  saveFixedDeposits(fixedDeposits);
  createAuditRecord(id, 'fixedDeposit', 'delete', deletedFD);
  return true;
};

export const getFixedDepositById = (id: string): FixedDeposit | null => {
  return fixedDeposits.find(fd => fd.id === id) || null;
};

export const getFixedDeposits = (): Promise<FixedDeposit[]> => {
  return Promise.resolve([...fixedDeposits]);
};

// Alias for addFixedDeposit to maintain compatibility with existing code
export const addFixedDeposit = (deposit: Partial<FixedDeposit>): Promise<FixedDeposit> => {
  const newDeposit = createFixedDeposit(deposit);
  return Promise.resolve(newDeposit);
};
