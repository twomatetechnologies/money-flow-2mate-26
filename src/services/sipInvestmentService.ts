
import { v4 as uuidv4 } from 'uuid';
import { SIPInvestment } from '@/types';
import { createAuditRecord } from './auditService';

const SIP_STORAGE_KEY = 'sipInvestments';

// Load SIP investments from localStorage
const loadSipInvestments = (): SIPInvestment[] => {
  try {
    const stored = localStorage.getItem(SIP_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading SIP investments:', error);
    return [];
  }
};

// Save SIP investments to localStorage
const saveSipInvestments = (investments: SIPInvestment[]): void => {
  try {
    localStorage.setItem(SIP_STORAGE_KEY, JSON.stringify(investments));
  } catch (error) {
    console.error('Error saving SIP investments:', error);
  }
};

// In-memory datastore with persistence
let sipInvestments = loadSipInvestments();

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
  saveSipInvestments(sipInvestments);
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
  
  saveSipInvestments(sipInvestments);
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
  
  saveSipInvestments(sipInvestments);
  createAuditRecord(id, 'sip', 'delete', deletedSIP);
  return true;
};

export const getSIPById = (id: string): SIPInvestment | null => {
  return sipInvestments.find(sip => sip.id === id) || null;
};

export const getSIPInvestments = (): Promise<SIPInvestment[]> => {
  return Promise.resolve(sipInvestments);
};
