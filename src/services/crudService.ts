
import { v4 as uuidv4 } from 'uuid';
import { 
  StockHolding, 
  FixedDeposit, 
  SIPInvestment, 
  InsurancePolicy, 
  GoldInvestment 
} from '@/types';
import { 
  mockStocks, 
  mockFixedDeposits, 
  mockSIPInvestments, 
  mockInsurancePolicies, 
  mockGoldInvestments 
} from './mockData';
import { createAuditRecord } from './auditService';

// In-memory datastores (in a real app, this would use a database)
let stocks = [...mockStocks];
let fixedDeposits = [...mockFixedDeposits];
let sipInvestments = [...mockSIPInvestments];
let insurancePolicies = [...mockInsurancePolicies];
let goldInvestments = [...mockGoldInvestments];

// CRUD operations for Stocks
export const createStock = (stock: Omit<StockHolding, 'id' | 'lastUpdated'>): StockHolding => {
  const newStock: StockHolding = {
    ...stock,
    id: uuidv4(),
    lastUpdated: new Date()
  };
  
  stocks.push(newStock);
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
  
  createAuditRecord(id, 'stock', 'delete', deletedStock);
  return true;
};

export const getStockById = (id: string): StockHolding | null => {
  return stocks.find(stock => stock.id === id) || null;
};

// CRUD operations for Fixed Deposits
export const createFixedDeposit = (fd: Omit<FixedDeposit, 'id'>): FixedDeposit => {
  const newFD: FixedDeposit = {
    ...fd,
    id: uuidv4()
  };
  
  fixedDeposits.push(newFD);
  createAuditRecord(newFD.id, 'fixedDeposit', 'create', newFD);
  return newFD;
};

export const updateFixedDeposit = (id: string, updates: Partial<FixedDeposit>): FixedDeposit | null => {
  const index = fixedDeposits.findIndex(fd => fd.id === id);
  if (index === -1) return null;
  
  const originalFD = { ...fixedDeposits[index] };
  
  fixedDeposits[index] = {
    ...fixedDeposits[index],
    ...updates
  };
  
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
  
  createAuditRecord(id, 'fixedDeposit', 'delete', deletedFD);
  return true;
};

export const getFixedDepositById = (id: string): FixedDeposit | null => {
  return fixedDeposits.find(fd => fd.id === id) || null;
};

// CRUD operations for SIP Investments
export const createSIP = (sip: Omit<SIPInvestment, 'id'>): SIPInvestment => {
  const newSIP: SIPInvestment = {
    ...sip,
    id: uuidv4()
  };
  
  sipInvestments.push(newSIP);
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
    id: uuidv4()
  };
  
  goldInvestments.push(newGold);
  createAuditRecord(newGold.id, 'gold', 'create', newGold);
  return newGold;
};

export const updateGold = (id: string, updates: Partial<GoldInvestment>): GoldInvestment | null => {
  const index = goldInvestments.findIndex(gold => gold.id === id);
  if (index === -1) return null;
  
  const originalGold = { ...goldInvestments[index] };
  
  goldInvestments[index] = {
    ...goldInvestments[index],
    ...updates
  };
  
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
  
  createAuditRecord(id, 'gold', 'delete', deletedGold);
  return true;
};

export const getGoldById = (id: string): GoldInvestment | null => {
  return goldInvestments.find(gold => gold.id === id) || null;
};

// Overrides the existing getter methods in mockData.ts
export const getStocks = (): Promise<StockHolding[]> => {
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
