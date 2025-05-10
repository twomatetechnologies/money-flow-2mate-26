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
  mockStocks, 
  mockFixedDeposits, 
  mockSIPInvestments, 
  mockInsurancePolicies, 
  mockGoldInvestments,
  mockNetWorthData
} from './mockData';
import { createAuditRecord } from './auditService';
import { isPostgresEnabled } from './db/dbConnector';

// Initialize datastores from localStorage or use mock data if not available
const loadFromStorage = <T>(key: string, mockData: T[]): T[] => {
  try {
    const storedData = localStorage.getItem(key);
    return storedData ? JSON.parse(storedData) : [...mockData];
  } catch (error) {
    console.error(`Error loading ${key} from localStorage:`, error);
    return [...mockData];
  }
};

// Save data to localStorage
const saveToStorage = <T>(key: string, data: T[]): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
};

// In-memory datastores with persistence
let stocks = loadFromStorage<StockHolding>('stocks', mockStocks);
let fixedDeposits = loadFromStorage<FixedDeposit>('fixedDeposits', mockFixedDeposits);
let sipInvestments = loadFromStorage<SIPInvestment>('sipInvestments', mockSIPInvestments);
let insurancePolicies = loadFromStorage<InsurancePolicy>('insurancePolicies', mockInsurancePolicies);
let goldInvestments = loadFromStorage<GoldInvestment>('goldInvestments', mockGoldInvestments);

// CRUD operations for Stocks
export const createStock = (stock: Omit<StockHolding, 'id' | 'lastUpdated'>): StockHolding => {
  const newStock: StockHolding = {
    ...stock,
    id: uuidv4(),
    lastUpdated: new Date()
  };
  
  stocks.push(newStock);
  saveToStorage('stocks', stocks);
  createAuditRecord(newStock.id, 'stock', 'create', newStock);
  return newStock;
};

export const updateStock = (id: string, updates: Partial<StockHolding>): StockHolding | null => {
  const index = stocks.findIndex(stock => stock.id === id);
  if (index === -1) return null;
  
  // Get the original stock for audit purposes
  const originalStock = { ...stocks[index] };
  
  // Update the stock
  stocks[index] = {
    ...stocks[index],
    ...updates,
    lastUpdated: new Date()
  };
  
  saveToStorage('stocks', stocks);
  createAuditRecord(id, 'stock', 'update', {
    previous: originalStock,
    current: stocks[index],
    changes: updates
  });
  
  return stocks[index];
};

export const deleteStock = (id: string): boolean => {
  const index = stocks.findIndex(stock => stock.id === id);
  if (index === -1) return false;
  
  const deletedStock = stocks[index];
  stocks.splice(index, 1);
  
  saveToStorage('stocks', stocks);
  createAuditRecord(id, 'stock', 'delete', deletedStock);
  return true;
};

export const getStockById = (id: string): StockHolding | null => {
  return stocks.find(stock => stock.id === id) || null;
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

// Data retrieval methods - ensure they work with localStorage
export const getStocks = (): Promise<StockHolding[]> => {
  // Always use localStorage in Lovable preview
  return Promise.resolve(stocks);
};

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

// Add the missing getNetWorth function
export const getNetWorth = async (): Promise<NetWorthData> => {
  // Calculate live net worth based on current data
  const stocksData = await getStocks();
  const fdData = await getFixedDeposits();
  const sipData = await getSIPInvestments();
  const goldData = await getGoldInvestments();
  const insuranceData = await getInsurancePolicies();
  
  const stocksTotal = stocksData.reduce((sum, stock) => sum + stock.value, 0);
  const fdTotal = fdData.reduce((sum, fd) => sum + fd.principal, 0);
  const sipTotal = sipData.reduce((sum, sip) => sum + sip.currentValue, 0);
  const goldTotal = goldData.reduce((sum, gold) => sum + gold.value, 0);
  const otherTotal = insuranceData.reduce((sum, insurance) => sum + insurance.premium * 12, 0);
  
  const total = stocksTotal + fdTotal + sipTotal + goldTotal + otherTotal;
  
  // Get the history from mock data but use live calculated total for current value
  const history = [...mockNetWorthData.history];
  if (history.length > 0) {
    // Update the latest history entry with the current calculated total
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
      providentFund: 0  // Add the missing property
    },
    history: history
  };
};
