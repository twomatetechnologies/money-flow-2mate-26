import { v4 as uuidv4 } from 'uuid';
import { FixedDeposit } from '@/types';
import { createAuditRecord } from './auditService';
import { downloadSampleCSV, exportToCSV } from '@/utils/exportUtils';
import * as XLSX from 'xlsx';

// In-memory datastore (in a real app, this would use a database)
let fixedDeposits: FixedDeposit[] = [];

export const getFixedDeposits = (): Promise<FixedDeposit[]> => {
  // Return a deep copy of the deposits to prevent accidental mutations
  return Promise.resolve(JSON.parse(JSON.stringify(fixedDeposits)));
};

export const createFixedDeposit = (deposit: Partial<FixedDeposit>): FixedDeposit => {
  const newDeposit: FixedDeposit = {
    ...deposit,
    id: uuidv4(),
    lastUpdated: new Date()
  } as FixedDeposit;
  
  fixedDeposits.push(newDeposit);
  createAuditRecord(newDeposit.id, 'fixedDeposit', 'create', newDeposit);
  return newDeposit;
};

export const updateFixedDeposit = (id: string, updates: Partial<FixedDeposit>): FixedDeposit | null => {
  const index = fixedDeposits.findIndex(deposit => deposit.id === id);
  if (index === -1) return null;
  
  const originalDeposit = { ...fixedDeposits[index] };
  
  fixedDeposits[index] = {
    ...fixedDeposits[index],
    ...updates,
    lastUpdated: new Date()
  };
  
  createAuditRecord(id, 'fixedDeposit', 'update', {
    previous: originalDeposit,
    current: fixedDeposits[index],
    changes: updates
  });
  
  return fixedDeposits[index];
};

export const deleteFixedDeposit = (id: string): boolean => {
  const index = fixedDeposits.findIndex(deposit => deposit.id === id);
  if (index === -1) return false;
  
  const deletedDeposit = fixedDeposits[index];
  fixedDeposits.splice(index, 1);
  
  createAuditRecord(id, 'fixedDeposit', 'delete', deletedDeposit);
  return true;
};

export const getFixedDepositById = (id: string): FixedDeposit | null => {
  const deposit = fixedDeposits.find(deposit => deposit.id === id);
  return deposit ? JSON.parse(JSON.stringify(deposit)) : null;
};

export const exportFixedDeposits = () => {
  const deposits = getFixedDeposits();
  const exportData = deposits.map(fd => ({
    'Bank Name': fd.bankName,
    'Account Number': fd.accountNumber,
    'Principal': fd.principal,
    'Interest Rate': fd.interestRate,
    'Start Date': fd.startDate,
    'Maturity Date': fd.maturityDate,
    'Maturity Amount': fd.maturityAmount,
    'Family Member ID': fd.familyMemberId
  }));
  
  exportToCSV(exportData, 'fixed_deposits');
};

export const downloadFixedDepositSample = () => {
  const headers = [
    'Bank Name',
    'Account Number',
    'Principal',
    'Interest Rate',
    'Start Date',
    'Maturity Date',
    'Maturity Amount',
    'Family Member ID'
  ];
  
  const sampleData = [
    {
      'Bank Name': 'HDFC Bank',
      'Account Number': 'FD123456',
      'Principal': '100000',
      'Interest Rate': '7.5',
      'Start Date': '2024-01-01',
      'Maturity Date': '2025-01-01',
      'Maturity Amount': '107500',
      'Family Member ID': 'member-1'
    },
    {
      'Bank Name': 'SBI',
      'Account Number': 'FD789012',
      'Principal': '200000',
      'Interest Rate': '7.0',
      'Start Date': '2024-02-01',
      'Maturity Date': '2025-02-01',
      'Maturity Amount': '214000',
      'Family Member ID': 'member-2'
    }
  ];
  
  downloadSampleCSV(headers, sampleData, 'fixed_deposits');
};

export const importFixedDeposits = async (file: File): Promise<FixedDeposit[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') {
          throw new Error('Invalid file content');
        }
        
        const workbook = XLSX.read(text, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);
        
        const deposits: FixedDeposit[] = data.map((row: any) => ({
          id: uuidv4(),
          bankName: row['Bank Name'],
          accountNumber: row['Account Number'],
          principal: parseFloat(row['Principal']),
          interestRate: parseFloat(row['Interest Rate']),
          startDate: new Date(row['Start Date']),
          maturityDate: new Date(row['Maturity Date']),
          maturityAmount: parseFloat(row['Maturity Amount']),
          familyMemberId: row['Family Member ID'],
          lastUpdated: new Date()
        }));
        
        // Import each deposit and create audit record
        deposits.forEach(deposit => {
          createFixedDeposit(deposit);
          createAuditRecord(deposit.id, 'fixedDeposit', 'import', deposit);
        });
        
        resolve(deposits);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsBinaryString(file);
  });
};
