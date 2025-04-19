import { v4 as uuidv4 } from 'uuid';
import { SavingsAccount } from '@/types';
import { createAuditRecord } from './auditService';
import { downloadSampleCSV, exportToCSV } from '@/utils/exportUtils';

// In-memory datastore (in a real app, this would use a database)
let savingsAccounts: SavingsAccount[] = [];

export const getSavingsAccounts = (): Promise<SavingsAccount[]> => {
  // Return a deep copy of the accounts to prevent accidental mutations
  return Promise.resolve(JSON.parse(JSON.stringify(savingsAccounts)));
};

export const createSavingsAccount = (account: Omit<SavingsAccount, 'id' | 'lastUpdated'>): SavingsAccount => {
  const newAccount: SavingsAccount = {
    ...account,
    id: uuidv4(),
    lastUpdated: new Date()
  };
  
  savingsAccounts.push(newAccount);
  createAuditRecord(newAccount.id, 'savingsAccount', 'create', newAccount);
  return newAccount;
};

export const updateSavingsAccount = (id: string, updates: Partial<SavingsAccount>): SavingsAccount | null => {
  const index = savingsAccounts.findIndex(account => account.id === id);
  if (index === -1) return null;
  
  const originalAccount = { ...savingsAccounts[index] };
  
  savingsAccounts[index] = {
    ...savingsAccounts[index],
    ...updates,
    lastUpdated: new Date()
  };
  
  createAuditRecord(id, 'savingsAccount', 'update', {
    previous: originalAccount,
    current: savingsAccounts[index],
    changes: updates
  });
  
  return savingsAccounts[index];
};

export const deleteSavingsAccount = (id: string): boolean => {
  const index = savingsAccounts.findIndex(account => account.id === id);
  if (index === -1) return false;
  
  const deletedAccount = savingsAccounts[index];
  savingsAccounts.splice(index, 1);
  
  createAuditRecord(id, 'savingsAccount', 'delete', deletedAccount);
  return true;
};

export const getSavingsAccountById = (id: string): SavingsAccount | null => {
  const account = savingsAccounts.find(account => account.id === id);
  return account ? JSON.parse(JSON.stringify(account)) : null;
};

export const exportSavingsAccounts = () => {
  const accounts = savingsAccounts.map(account => ({
    Bank: account.bankName,
    'Account Number': account.accountNumber,
    'Account Type': account.accountType,
    Branch: account.branchName,
    IFSC: account.ifscCode,
    Balance: account.balance,
    'Interest Rate': account.interestRate,
    'Family Member ID': account.familyMemberId
  }));
  
  exportToCSV(accounts, 'savings_accounts');
};

export const downloadSavingsAccountSample = () => {
  const headers = [
    'Bank',
    'Account Number',
    'Account Type',
    'Branch',
    'IFSC',
    'Balance',
    'Interest Rate',
    'Family Member ID'
  ];
  
  const sampleData = [
    {
      'Bank': 'HDFC Bank',
      'Account Number': 'XXXX1234',
      'Account Type': 'Savings',
      'Branch': 'Main Branch',
      'IFSC': 'HDFC0001234',
      'Balance': '50000',
      'Interest Rate': '3.5',
      'Family Member ID': 'member-1'
    },
    {
      'Bank': 'SBI',
      'Account Number': 'XXXX5678',
      'Account Type': 'Salary',
      'Branch': 'City Branch',
      'IFSC': 'SBIN0005678',
      'Balance': '75000',
      'Interest Rate': '3.0',
      'Family Member ID': 'member-2'
    }
  ];
  
  downloadSampleCSV(headers, sampleData, 'savings_accounts');
};

export const importSavingsAccounts = async (file: File): Promise<SavingsAccount[]> => {
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
        
        const accounts: SavingsAccount[] = data.map((row: any) => ({
          id: uuidv4(),
          bankName: row['Bank'],
          accountNumber: row['Account Number'],
          accountType: row['Account Type'],
          branchName: row['Branch'],
          ifscCode: row['IFSC'],
          balance: parseFloat(row['Balance']),
          interestRate: parseFloat(row['Interest Rate']),
          familyMemberId: row['Family Member ID'],
          lastUpdated: new Date()
        }));
        
        // Import each account
        accounts.forEach(account => {
          savingsAccounts.push(account);
          createAuditRecord(account.id, 'savingsAccount', 'import', account);
        });
        
        resolve(accounts);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsBinaryString(file);
  });
};
