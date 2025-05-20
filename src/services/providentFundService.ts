import { v4 as uuidv4 } from 'uuid';
import { ProvidentFund } from '@/types';
import { createAuditRecord } from './auditService';
import { isPostgresEnabled } from './db/dbConnector';
import * as providentFundDbService from './db/providentFundDbService';

// Mock data storage
let providentFunds: ProvidentFund[] = [];

const PF_STORAGE_KEY = 'providentFunds';

// Initialize with sample data if needed
const initializeProvidentFunds = () => {
  const storedPFs = localStorage.getItem(PF_STORAGE_KEY);
  if (storedPFs) {
    try {
      providentFunds = JSON.parse(storedPFs).map((pf: any) => ({
        ...pf,
        startDate: new Date(pf.startDate),
        lastUpdated: new Date(pf.lastUpdated),
      }));
    } catch (error) {
      console.error('Error parsing provident funds from localStorage:', error);
      createSampleData();
    }
  } else {
    createSampleData();
  }
};

// Create sample data for visualization
const createSampleData = () => {
  providentFunds = [
    {
      id: uuidv4(),
      employerName: 'ABC Company',
      accountNumber: 'PF1234567890',
      employeeContribution: 150000,
      employerContribution: 120000,
      totalBalance: 270000,
      interestRate: 8.15,
      startDate: new Date(2020, 0, 15),
      lastUpdated: new Date(),
      monthlyContribution: 7500,
      notes: 'Company provident fund',
      familyMemberId: 'self-default',
    },
    {
      id: uuidv4(),
      employerName: 'XYZ Corp',
      accountNumber: 'PF9876543210',
      employeeContribution: 95000,
      employerContribution: 85000,
      totalBalance: 180000,
      interestRate: 8.05,
      startDate: new Date(2021, 3, 10),
      lastUpdated: new Date(),
      monthlyContribution: 5000,
      notes: 'Previous employer PF',
      familyMemberId: 'spouse-default',
    }
  ];
  saveProvidentFunds();
};

// Save provident funds to localStorage
const saveProvidentFunds = () => {
  localStorage.setItem(PF_STORAGE_KEY, JSON.stringify(providentFunds));
};

// Check if we should use database operations
const useDatabase = isPostgresEnabled();

// Get all provident funds
export const getProvidentFunds = async (): Promise<ProvidentFund[]> => {
  if (useDatabase) {
    return await providentFundDbService.getProvidentFunds();
  }
  
  if (providentFunds.length === 0) {
    initializeProvidentFunds();
  }
  return [...providentFunds];
};

// Get a single provident fund by ID
export const getProvidentFundById = async (id: string): Promise<ProvidentFund | undefined> => {
  if (useDatabase) {
    return await providentFundDbService.getProvidentFundById(id) || undefined;
  }
  
  if (providentFunds.length === 0) {
    initializeProvidentFunds();
  }
  return providentFunds.find(pf => pf.id === id);
};

// Create a new provident fund
export const createProvidentFund = async (pfData: Omit<ProvidentFund, 'id'>): Promise<ProvidentFund> => {
  if (useDatabase) {
    return await providentFundDbService.addProvidentFund(pfData);
  }
  
  const newPF: ProvidentFund = {
    ...pfData,
    id: uuidv4(),
  };
  providentFunds.push(newPF);
  saveProvidentFunds();
  createAuditRecord(newPF.id, 'providentFund', 'create', newPF);
  return newPF;
};

// Update an existing provident fund
export const updateProvidentFund = async (pfData: ProvidentFund): Promise<ProvidentFund> => {
  if (useDatabase) {
    return await providentFundDbService.updateProvidentFund(pfData.id, pfData);
  }
  
  const index = providentFunds.findIndex(pf => pf.id === pfData.id);
  if (index === -1) {
    throw new Error('Provident Fund not found');
  }
  const originalPF = { ...providentFunds[index] };
  providentFunds[index] = {
    ...pfData,
    lastUpdated: new Date()
  };
  saveProvidentFunds();
  createAuditRecord(pfData.id, 'providentFund', 'update', {
    previous: originalPF,
    current: providentFunds[index],
    changes: pfData
  });
  return providentFunds[index];
};

// Delete a provident fund
export const deleteProvidentFund = async (id: string): Promise<void> => {
  if (useDatabase) {
    await providentFundDbService.deleteProvidentFund(id);
    return;
  }
  
  const index = providentFunds.findIndex(pf => pf.id === id);
  if (index === -1) {
    throw new Error('Provident Fund not found');
  }
  
  const deletedPF = { ...providentFunds[index] };
  providentFunds.splice(index, 1);
  saveProvidentFunds();
  
  // Create audit record after successful deletion
  await createAuditRecord(id, 'providentFund', 'delete', deletedPF);
};
