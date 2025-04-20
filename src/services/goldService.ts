
import { v4 as uuidv4 } from 'uuid';
import { GoldInvestment } from '@/types';
import { createAuditRecord } from './auditService';
import { downloadSampleCSV, exportToCSV } from '@/utils/exportUtils';
import * as XLSX from 'xlsx';
import { getGoldInvestments as fetchGoldInvestments, createGold as addGold } from '@/services/crudService';

export const exportGoldInvestments = () => {
  const investments = fetchGoldInvestments();
  investments.then(data => {
    const exportData = data.map(gold => ({
      'Type': gold.type,
      'Quantity': gold.quantity,
      'Purchase Date': gold.purchaseDate,
      'Purchase Price': gold.purchasePrice,
      'Current Price': gold.currentPrice,
      'Value': gold.value,
      'Location/Notes': gold.location || gold.notes,
      'Family Member ID': gold.familyMemberId
    }));
    
    exportToCSV(exportData, 'gold_investments');
  });
};

export const downloadGoldSample = () => {
  const headers = [
    'Type',
    'Quantity',
    'Purchase Date',
    'Purchase Price',
    'Current Price',
    'Value',
    'Location/Notes',
    'Family Member ID'
  ];
  
  const sampleData = [
    {
      'Type': 'Physical',
      'Quantity': '10',
      'Purchase Date': '2024-01-01',
      'Purchase Price': '5500',
      'Current Price': '5800',
      'Value': '58000',
      'Location/Notes': 'Bank Locker',
      'Family Member ID': 'member-1'
    },
    {
      'Type': 'Digital',
      'Quantity': '5',
      'Purchase Date': '2024-02-01',
      'Purchase Price': '5600',
      'Current Price': '5800',
      'Value': '29000',
      'Location/Notes': 'Digital Vault',
      'Family Member ID': 'member-2'
    }
  ];
  
  downloadSampleCSV(headers, sampleData, 'gold_investments');
};

export const importGoldInvestments = async (file: File): Promise<GoldInvestment[]> => {
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
        
        const investments: GoldInvestment[] = data.map((row: any) => ({
          id: uuidv4(),
          type: row['Type'],
          quantity: parseFloat(row['Quantity']),
          purchaseDate: new Date(row['Purchase Date']),
          purchasePrice: parseFloat(row['Purchase Price']),
          currentPrice: parseFloat(row['Current Price']),
          value: parseFloat(row['Value']),
          location: row['Location/Notes'],
          familyMemberId: row['Family Member ID'],
          lastUpdated: new Date()
        }));
        
        // Import each investment and create audit record
        investments.forEach(investment => {
          addGold(investment);
          createAuditRecord(investment.id, 'gold', 'import', investment);
        });
        
        resolve(investments);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsBinaryString(file);
  });
};
