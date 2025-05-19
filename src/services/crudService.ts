import { v4 as uuidv4 } from 'uuid';
import { 
  StockHolding, 
  FixedDeposit, 
  SIPInvestment, 
  InsurancePolicy, 
  GoldInvestment,
  NetWorthData 
} from '@/types';
import { 
  mockFixedDeposits, 
  mockSIPInvestments, 
  mockInsurancePolicies, 
  mockGoldInvestments,
  mockNetWorthData
} from './mockData';
import { createAuditRecord } from './auditService';
import * as stockService from './stockService';

// Helper function to load from localStorage or use mock data (for non-stock entities)
const loadFromStorage = <T>(key: string, mockData: T[]): T[] => {
  try {
    const storedData = localStorage.getItem(key);
    return storedData ? JSON.parse(storedData) : [...mockData];
  } catch (error) {
    console.error(`Error loading ${key} from localStorage:`, error);
    return [...mockData];
  }
};

// Helper function to save data to localStorage (for non-stock entities)
const saveToStorage = <T>(key: string, data: T[]): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
};

// In-memory datastores with persistence for non-stock entities
let fixedDeposits = loadFromStorage<FixedDeposit>('fixedDeposits', mockFixedDeposits);
let sipInvestments = loadFromStorage<SIPInvestment>('sipInvestments', mockSIPInvestments);
let insurancePolicies = loadFromStorage<InsurancePolicy>('insurancePolicies', mockInsurancePolicies);
let goldInvestments = loadFromStorage<GoldInvestment>('goldInvestments', mockGoldInvestments);

// CRUD operations for Stocks - Delegated to stockService
export const createStock = async (stock: Omit<StockHolding, 'id' | 'lastUpdated'>): Promise<StockHolding> => {
  return stockService.createStock(stock);
};

export const updateStock = async (id: string, updates: Partial<StockHolding>): Promise<StockHolding | null> => {
  return stockService.updateStock(id, updates);
};

export const deleteStock = async (id: string): Promise<boolean> => {
  return stockService.deleteStock(id);
};

export const getStockById = async (id: string): Promise<StockHolding | null> => {
  return stockService.getStockById(id);
};

export const getStocks = async (): Promise<StockHolding[]> => {
  return stockService.getStocks();
};

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
  saveToStorage('fixedDeposits', fixedDeposits);
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
  
  saveToStorage('fixedDeposits', fixedDeposits);
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
  
  saveToStorage('fixedDeposits', fixedDeposits);
  createAuditRecord(id, 'fixedDeposit', 'delete', deletedFD);
  return true;
};

export const getFixedDepositById = (id: string): FixedDeposit | null => {
  return fixedDeposits.find(fd => fd.id === id) || null;
};

// CRUD operations for SIP Investments
export const createSIP = (sip: Partial<SIPInvestment>): SIPInvestment => {
  // Set default values for any missing required fields
  const newSIP: SIPInvestment = {
    name: sip.name || 'Unnamed SIP',
    type: sip.type || 'Mutual Fund',
    amount: sip.amount || 0,
    frequency: sip.frequency || 'Monthly',
    startDate: sip.startDate || new Date(),
    duration: sip.duration || 12,
    currentValue: sip.currentValue || 0,
    returns: sip.returns || 0,
    returnsPercent: sip.returnsPercent || 0,
    familyMemberId: sip.familyMemberId || 'self-default',
    id: uuidv4()
  };
  
  sipInvestments.push(newSIP);
  saveToStorage('sipInvestments', sipInvestments);
  createAuditRecord(newSIP.id, 'sip', 'create', newSIP);
  return newSIP;
};

export const updateSIP = (id: string, updates: Partial<SIPInvestment>): SIPInvestment | null => {
  const index = sipInvestments.findIndex(sip => sip.id === id);
  if (index === -1) return null;
  
  const originalSIP = { ...sipInvestments[index] };
  
  sipInvestments[index] = {
    ...sipInvestments[index],
    ...updates
  };
  
  saveToStorage('sipInvestments', sipInvestments);
  createAuditRecord(id, 'sip', 'update', {
    previous: originalSIP,
    current: sipInvestments[index],
    changes: updates
  });
  
  return sipInvestments[index];
};

export const deleteSIP = (id: string): boolean => {
  const index = sipInvestments.findIndex(sip => sip.id === id);
  if (index === -1) return false;
  
  const deletedSIP = sipInvestments[index];
  sipInvestments.splice(index, 1);
  
  saveToStorage('sipInvestments', sipInvestments);
  createAuditRecord(id, 'sip', 'delete', deletedSIP);
  return true;
};

export const getSIPById = (id: string): SIPInvestment | null => {
  return sipInvestments.find(sip => sip.id === id) || null;
};

// CRUD operations for Insurance Policies
export const createInsurance = (insurance: Omit<InsurancePolicy, 'id'>): InsurancePolicy => {
  const newInsurance: InsurancePolicy = {
    ...insurance,
    id: uuidv4()
  };
  
  insurancePolicies.push(newInsurance);
  saveToStorage('insurancePolicies', insurancePolicies);
  createAuditRecord(newInsurance.id, 'insurance', 'create', newInsurance);
  return newInsurance;
};

export const updateInsurance = (id: string, updates: Partial<InsurancePolicy>): InsurancePolicy | null => {
  const index = insurancePolicies.findIndex(insurance => insurance.id === id);
  if (index === -1) return null;
  
  const originalInsurance = { ...insurancePolicies[index] };
  
  insurancePolicies[index] = {
    ...insurancePolicies[index],
    ...updates
  };
  
  saveToStorage('insurancePolicies', insurancePolicies);
  createAuditRecord(id, 'insurance', 'update', {
    previous: originalInsurance,
    current: insurancePolicies[index],
    changes: updates
  });
  
  return insurancePolicies[index];
};

export const deleteInsurance = (id: string): boolean => {
  const index = insurancePolicies.findIndex(insurance => insurance.id === id);
  if (index === -1) return false;
  
  const deletedInsurance = insurancePolicies[index];
  insurancePolicies.splice(index, 1);
  
  saveToStorage('insurancePolicies', insurancePolicies);
  createAuditRecord(id, 'insurance', 'delete', deletedInsurance);
  return true;
};

export const getInsuranceById = (id: string): InsurancePolicy | null => {
  return insurancePolicies.find(insurance => insurance.id === id) || null;
};

// CRUD operations for Gold Investments
export const createGold = (gold: Omit<GoldInvestment, 'id'>): GoldInvestment => {
  const newGold: GoldInvestment = {
    ...gold,
    id: uuidv4(),
    lastUpdated: new Date()
  };
  
  goldInvestments.push(newGold);
  saveToStorage('goldInvestments', goldInvestments);
  createAuditRecord(newGold.id, 'gold', 'create', newGold);
  return newGold;
};

export const updateGold = (id: string, updates: Partial<GoldInvestment>): GoldInvestment | null => {
  const index = goldInvestments.findIndex(gold => gold.id === id);
  if (index === -1) return null;
  
  const originalGold = { ...goldInvestments[index] };
  
  goldInvestments[index] = {
    ...goldInvestments[index],
    ...updates,
    lastUpdated: new Date()
  };
  
  saveToStorage('goldInvestments', goldInvestments);
  createAuditRecord(id, 'gold', 'update', {
    previous: originalGold,
    current: goldInvestments[index],
    changes: updates
  });
  
  return goldInvestments[index];
};

export const deleteGold = (id: string): boolean => {
  const index = goldInvestments.findIndex(gold => gold.id === id);
  if (index === -1) return false;
  
  const deletedGold = goldInvestments[index];
  goldInvestments.splice(index, 1);
  
  saveToStorage('goldInvestments', goldInvestments);
  createAuditRecord(id, 'gold', 'delete', deletedGold);
  return true;
};

export const getGoldById = (id: string): GoldInvestment | null => {
  return goldInvestments.find(gold => gold.id === id) || null;
};

// Data retrieval methods for non-stock entities
export const getFixedDeposits = (): Promise<FixedDeposit[]> => {
  return Promise.resolve(fixedDeposits);
};

export const getSIPInvestments = (): Promise<SIPInvestment[]> => {
  return Promise.resolve(sipInvestments);
};

export const getInsurancePolicies = (): Promise<InsurancePolicy[]> => {
  return Promise.resolve(insurancePolicies);
};

export const getGoldInvestments = (): Promise<GoldInvestment[]> => {
  return Promise.resolve(goldInvestments);
};

// Add the missing getNetWorth function - this one calculates based on current data from various services
export const getNetWorth = async (): Promise<NetWorthData> => {
  try {
    const stocksData = await getStocks(); // Uses the new getStocks path
    const fdData = await getFixedDeposits();
    const sipData = await getSIPInvestments();
    const goldData = await getGoldInvestments();
    const insuranceData = await getInsurancePolicies(); 
    
    // Ensure 'value' is used for stocks, or calculate if not present
    const stocksTotal = Array.isArray(stocksData) ? stocksData.reduce((sum, stock) => {
        if (!stock) return sum; // Skip null or undefined stocks
        const value = typeof stock.value === 'number' ? stock.value : 
                     ((stock.currentPrice || 0) * (stock.quantity || 0));
        return sum + (isNaN(value) ? 0 : value); // Ensure we don't add NaN
    }, 0) : 0;
    
    const fdTotal = Array.isArray(fdData) ? fdData.reduce((sum, fd) => 
      sum + (fd?.principal || 0), 0) : 0;
      
    const sipTotal = Array.isArray(sipData) ? sipData.reduce((sum, sip) => 
      sum + (sip?.currentValue || 0), 0) : 0;
      
    const goldTotal = Array.isArray(goldData) ? goldData.reduce((sum, gold) => 
      sum + (gold?.value || 0), 0) : 0;
    
    // For simplicity, we'll use 0 for 'other' when calculating from scratch
    const otherTotal = 0;
    const providentFundTotal = 0; // Placeholder, needs its own data source
    
    const total = stocksTotal + fdTotal + sipTotal + goldTotal + otherTotal + providentFundTotal;
    
    const history = [...mockNetWorthData.history]; // Keep mock history for now
    if (history.length > 0) {
      history[history.length - 1] = {
        date: new Date(),
        value: total
      };
    }
    
    return {
      total: total,
      breakdown: {
        stocks: stocksTotal,
        fixedDeposits: fdTotal,
        sip: sipTotal,
        gold: goldTotal,
        other: otherTotal, 
        providentFund: providentFundTotal 
      },
      history: history
    };
  } catch (error) {
    console.error("Error calculating net worth:", error);
    // Return mock data as fallback
    return mockNetWorthData;
  }
};
