import { v4 as uuidv4 } from 'uuid';
import { SIPInvestment } from '@/types';
import { createAuditRecord } from './auditService';
import { isPostgresEnabled } from './db/dbConnector';
import * as sipDbService from './db/sipDbService';

// In-memory datastore (in a real app, this would use a database)
let sipInvestments: SIPInvestment[] = [];

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

// Initialize local storage data
sipInvestments = loadSipInvestments();

// Check if we should use database operations
const useDatabase = isPostgresEnabled();

export const getSIPInvestments = (): Promise<SIPInvestment[]> => {
  if (useDatabase) {
    return sipDbService.getSIPInvestments();
  }
  
  // Return a deep copy of the SIPs to prevent accidental mutations
  return Promise.resolve(JSON.parse(JSON.stringify(sipInvestments)));
};

export const addSIPInvestment = (sip: Partial<SIPInvestment>): Promise<SIPInvestment> => {
  if (useDatabase) {
    return sipDbService.addSIPInvestment(sip);
  }
  
  const newSIP: SIPInvestment = {
    id: uuidv4(),
    name: sip.name || '',
    type: (sip.type as SIPInvestment['type']) || 'Other',
    amount: sip.amount || 0,
    frequency: sip.frequency || 'Monthly',
    currentValue: sip.currentValue || 0,
    returns: sip.returns || 0,
    returnsPercent: sip.returnsPercent || 0,
    familyMemberId: sip.familyMemberId || '',
    startDate: sip.startDate || new Date(),
  };
  
  sipInvestments.push(newSIP);
  saveSipInvestments(sipInvestments);
  createAuditRecord(newSIP.id, 'sip', 'create', newSIP);
  return Promise.resolve(newSIP);
};

export const updateSIPInvestment = (id: string, updates: Partial<SIPInvestment>): Promise<SIPInvestment> => {
  if (useDatabase) {
    return sipDbService.updateSIPInvestment(id, updates);
  }
  
  const index = sipInvestments.findIndex(sip => sip.id === id);
  if (index === -1) {
    return Promise.reject(new Error('SIP investment not found'));
  }
  
  const originalSIP = { ...sipInvestments[index] };
  
  sipInvestments[index] = {
    ...sipInvestments[index],
    ...updates,
  };
  
  saveSipInvestments(sipInvestments);
  createAuditRecord(id, 'sip', 'update', {
    previous: originalSIP,
    current: sipInvestments[index],
    changes: updates
  });
  
  return Promise.resolve(sipInvestments[index]);
};

export const deleteSIPInvestment = async (id: string): Promise<void> => {
  if (useDatabase) {
    await sipDbService.deleteSIPInvestment(id);
    return;
  }
  
  const index = sipInvestments.findIndex(sip => sip.id === id);
  if (index === -1) {
    throw new Error('SIP investment not found');
  }
  
  const deletedSIP = { ...sipInvestments[index] };
  sipInvestments.splice(index, 1);
  saveSipInvestments(sipInvestments);
  
  // Create audit record after successful deletion
  await createAuditRecord(id, 'sip', 'delete', deletedSIP);
};

// Export SIP investments
export const exportSIPInvestments = (format: 'csv' | 'excel' = 'csv') => {
  const exportData = sipInvestments.map(sip => ({
    'Name': sip.name,
    'Type': sip.type,
    'Amount': sip.amount,
    'Frequency': sip.frequency,
    'Start Date': sip.startDate ? new Date(sip.startDate).toISOString().split('T')[0] : '',
    'Duration': sip.duration || '',
    'Current Value': sip.currentValue,
    'Returns': sip.returns,
    'Returns %': sip.returnsPercent,
    'Family Member ID': sip.familyMemberId || ''
  }));
  
  return exportData;
};

// Get sample data for import template
export const getSIPSampleData = () => {
  const headers = [
    'Name',
    'Type',
    'Amount',
    'Frequency',
    'Start Date',
    'Duration',
    'Current Value',
    'Returns',
    'Returns %',
    'Family Member ID'
  ];
  
  const data = [
    [
      'HDFC Top 200 Fund',
      'Mutual Fund',
      '5000',
      'Monthly',
      '2023-01-15',
      '36',
      '65000',
      '5000',
      '8.33',
      'member-1'
    ],
    [
      'ICICI Tax Saver Fund',
      'ELSS',
      '2000',
      'Monthly',
      '2023-03-10',
      '60',
      '24000',
      '1200',
      '5.26',
      'member-2'
    ]
  ];
  
  return { headers, data };
};

// Import SIP investments from parsed data
export const importSIPInvestments = async (data: any[]): Promise<{ success: number, failed: number }> => {
  let success = 0;
  let failed = 0;
  
  for (const item of data) {
    try {
      const sipData: Partial<SIPInvestment> = {
        name: item['Name'] || '',
        type: item['Type'] as SIPInvestment['type'] || 'Other',
        amount: parseFloat(item['Amount']) || 0,
        frequency: item['Frequency'] as SIPInvestment['frequency'] || 'Monthly',
        startDate: item['Start Date'] ? new Date(item['Start Date']) : new Date(),
        duration: parseInt(item['Duration']) || undefined,
        currentValue: parseFloat(item['Current Value']) || 0,
        returns: parseFloat(item['Returns']) || 0,
        returnsPercent: parseFloat(item['Returns %']) || 0,
        familyMemberId: item['Family Member ID'] || ''
      };
      
      await addSIPInvestment(sipData);
      success++;
    } catch (error) {
      console.error('Error importing SIP record:', error);
      failed++;
    }
  }
  
  return { success, failed };
};
