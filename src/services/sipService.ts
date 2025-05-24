import { v4 as uuidv4 } from 'uuid';
import { SIPInvestment } from '@/types';
import { createAuditRecord } from './auditService';
import { isPostgresEnabled } from './db/dbConnector';
import * as sipDbService from './db/sipDbService';

// Initialize local storage data if needed
let sipInvestments: SIPInvestment[] = [];

// Check if we should use database operations
const useDatabase = isPostgresEnabled();

export const getSIPInvestments = (): Promise<SIPInvestment[]> => {
  if (useDatabase) {
    return sipDbService.getSIPInvestments();
  }
  
  // If PostgreSQL is not enabled, this will always be empty for SIP module
  return Promise.resolve([]);
};

export const addSIPInvestment = (sip: Partial<SIPInvestment>): Promise<SIPInvestment> => {
  if (useDatabase) {
    return sipDbService.addSIPInvestment(sip);
  }
  
  // If PostgreSQL is not enabled, return error
  return Promise.reject(new Error('PostgreSQL is required for SIP investments'));
};

export const updateSIPInvestment = (id: string, updates: Partial<SIPInvestment>): Promise<SIPInvestment> => {
  if (useDatabase) {
    return sipDbService.updateSIPInvestment(id, updates);
  }
  
  // If PostgreSQL is not enabled, return error
  return Promise.reject(new Error('PostgreSQL is required for SIP investments'));
};

export const deleteSIPInvestment = async (id: string): Promise<void> => {
  if (useDatabase) {
    await sipDbService.deleteSIPInvestment(id);
    return;
  }
  
  // If PostgreSQL is not enabled, return error
  throw new Error('PostgreSQL is required for SIP investments');
};

// Export SIP investments
export const exportSIPInvestments = async (format: 'csv' | 'excel' = 'csv') => {
  // Get data from database
  const investments = await getSIPInvestments();
  
  return investments.map(sip => ({
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
      
      // Always use the database service to add investments
      await sipDbService.addSIPInvestment(sipData);
      success++;
    } catch (error) {
      console.error('Error importing SIP record:', error);
      failed++;
    }
  }
  
  return { success, failed };
};
