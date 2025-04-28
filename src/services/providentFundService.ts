
import { v4 as uuidv4 } from 'uuid';
import { ProvidentFund } from '@/types';

// Mock data storage
let providentFunds: ProvidentFund[] = [];

// Initialize with sample data if needed
const initializeProvidentFunds = () => {
  const storedPFs = localStorage.getItem('providentFunds');
  if (storedPFs) {
    try {
      providentFunds = JSON.parse(storedPFs).map((pf: any) => ({
        ...pf,
        startDate: new Date(pf.startDate),
        lastUpdated: new Date(pf.lastUpdated),
      }));
    } catch (error) {
      console.error('Error parsing provident funds from localStorage:', error);
      providentFunds = [];
    }
  } else {
    // Example provident fund
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
        familyMemberId: undefined,
      },
    ];
    saveProvidentFunds();
  }
};

// Save provident funds to localStorage
const saveProvidentFunds = () => {
  localStorage.setItem('providentFunds', JSON.stringify(providentFunds));
};

// Get all provident funds
export const getProvidentFunds = async (): Promise<ProvidentFund[]> => {
  if (providentFunds.length === 0) {
    initializeProvidentFunds();
  }
  return [...providentFunds];
};

// Get a single provident fund by ID
export const getProvidentFundById = async (id: string): Promise<ProvidentFund | undefined> => {
  if (providentFunds.length === 0) {
    initializeProvidentFunds();
  }
  return providentFunds.find(pf => pf.id === id);
};

// Create a new provident fund
export const createProvidentFund = async (pfData: Omit<ProvidentFund, 'id'>): Promise<ProvidentFund> => {
  const newPF: ProvidentFund = {
    ...pfData,
    id: uuidv4(),
  };
  providentFunds.push(newPF);
  saveProvidentFunds();
  return newPF;
};

// Update an existing provident fund
export const updateProvidentFund = async (pfData: ProvidentFund): Promise<ProvidentFund> => {
  const index = providentFunds.findIndex(pf => pf.id === pfData.id);
  if (index === -1) {
    throw new Error('Provident Fund not found');
  }
  providentFunds[index] = pfData;
  saveProvidentFunds();
  return pfData;
};

// Delete a provident fund
export const deleteProvidentFund = async (id: string): Promise<void> => {
  const index = providentFunds.findIndex(pf => pf.id === id);
  if (index === -1) {
    throw new Error('Provident Fund not found');
  }
  providentFunds.splice(index, 1);
  saveProvidentFunds();
};
