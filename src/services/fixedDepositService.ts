
import { v4 as uuidv4 } from 'uuid';
import { FixedDeposit } from '@/types';
import { createAuditRecord } from './auditService';
import { isPostgresEnabled } from './db/dbConnector';
import * as fixedDepositDbService from './db/fixedDepositDbService';

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

// Check if we should use database operations
const useDatabase = isPostgresEnabled();

// CRUD operations for Fixed Deposits with conditional DB/localStorage usage
export const createFixedDeposit = async (fd: Partial<FixedDeposit>): Promise<FixedDeposit> => {
  if (useDatabase) {
    return await fixedDepositDbService.addFixedDeposit(fd);
  }
  
  // Calculate maturity amount if not provided
  const principal = fd.principal || 0;
  const interestRate = fd.interestRate || 0;
  const startDate = fd.startDate || new Date();
  const maturityDate = fd.maturityDate || new Date();
  const timeDiff = Math.max(0, (maturityDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24 * 365));
  const calculatedMaturityAmount = principal + (principal * interestRate * timeDiff) / 100;
  
  // Set default values for any missing required fields
  const newFD: FixedDeposit = {
    bankName: fd.bankName || 'Unknown Bank',
    accountNumber: fd.accountNumber || 'XXXX' + Math.floor(Math.random() * 10000),
    principal: principal,
    interestRate: interestRate,
    startDate: startDate,
    maturityDate: maturityDate,
    maturityAmount: calculatedMaturityAmount,
    isAutoRenew: fd.isAutoRenew || false,
    notes: fd.notes || '',
    familyMemberId: fd.familyMemberId || 'self-default', // Default to "self" if not provided
    id: uuidv4(),
    lastUpdated: new Date()
  };
  
  fixedDeposits.push(newFD);
  saveFixedDeposits(fixedDeposits);
  createAuditRecord(newFD.id, 'fixedDeposit', 'create', newFD);
  return newFD;
};

export const updateFixedDeposit = async (id: string, updates: Partial<FixedDeposit>): Promise<FixedDeposit | null> => {
  if (useDatabase) {
    return await fixedDepositDbService.updateFixedDeposit(id, updates);
  }
  
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

export const deleteFixedDeposit = async (id: string): Promise<boolean> => {
  if (useDatabase) {
    return await fixedDepositDbService.deleteFixedDeposit(id);
  }
  
  const index = fixedDeposits.findIndex(fd => fd.id === id);
  if (index === -1) return false;
  
  const deletedFD = fixedDeposits[index];
  fixedDeposits.splice(index, 1);
  
  saveFixedDeposits(fixedDeposits);
  createAuditRecord(id, 'fixedDeposit', 'delete', deletedFD);
  return true;
};

export const getFixedDepositById = async (id: string): Promise<FixedDeposit | null> => {
  if (useDatabase) {
    return await fixedDepositDbService.getFixedDepositById(id);
  }
  
  return fixedDeposits.find(fd => fd.id === id) || null;
};

export const getFixedDeposits = async (): Promise<FixedDeposit[]> => {
  if (useDatabase) {
    return await fixedDepositDbService.getFixedDeposits();
  }
  
  return Promise.resolve([...fixedDeposits]);
};

// Alias for addFixedDeposit to maintain compatibility with existing code
export const addFixedDeposit = async (deposit: Partial<FixedDeposit>): Promise<FixedDeposit> => {
  return await createFixedDeposit(deposit);
};
