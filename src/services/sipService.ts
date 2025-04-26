
import { v4 as uuidv4 } from 'uuid';
import { SIPInvestment } from '@/types';
import { createAuditRecord } from './auditService';

// In-memory datastore (in a real app, this would use a database)
let sipInvestments: SIPInvestment[] = [];

export const getSIPInvestments = (): Promise<SIPInvestment[]> => {
  // Return a deep copy of the SIPs to prevent accidental mutations
  return Promise.resolve(JSON.parse(JSON.stringify(sipInvestments)));
};

export const addSIPInvestment = (sip: Partial<SIPInvestment>): Promise<SIPInvestment> => {
  const newSIP: SIPInvestment = {
    id: uuidv4(),
    name: sip.name || '',
    type: sip.type || '',
    amount: sip.amount || 0,
    frequency: sip.frequency || 'Monthly',
    currentValue: sip.currentValue || 0,
    returns: sip.returns || 0,
    returnsPercent: sip.returnsPercent || 0,
    familyMemberId: sip.familyMemberId || '',
    startDate: sip.startDate || new Date(),
    lastUpdated: new Date(),
  };
  
  sipInvestments.push(newSIP);
  createAuditRecord(newSIP.id, 'sipInvestment', 'create', newSIP);
  return Promise.resolve(newSIP);
};

export const updateSIPInvestment = (id: string, updates: Partial<SIPInvestment>): Promise<SIPInvestment> => {
  const index = sipInvestments.findIndex(sip => sip.id === id);
  if (index === -1) {
    return Promise.reject(new Error('SIP investment not found'));
  }
  
  const originalSIP = { ...sipInvestments[index] };
  
  sipInvestments[index] = {
    ...sipInvestments[index],
    ...updates,
    lastUpdated: new Date()
  };
  
  createAuditRecord(id, 'sipInvestment', 'update', {
    previous: originalSIP,
    current: sipInvestments[index],
    changes: updates
  });
  
  return Promise.resolve(sipInvestments[index]);
};

export const deleteSIPInvestment = (id: string): Promise<void> => {
  const index = sipInvestments.findIndex(sip => sip.id === id);
  if (index === -1) {
    return Promise.reject(new Error('SIP investment not found'));
  }
  
  const deletedSIP = sipInvestments[index];
  sipInvestments.splice(index, 1);
  
  createAuditRecord(id, 'sipInvestment', 'delete', deletedSIP);
  return Promise.resolve();
};
