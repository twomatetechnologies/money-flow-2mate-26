
import { v4 as uuidv4 } from 'uuid';
import { GoldInvestment } from '@/types';
import { createAuditRecord } from './auditService';
import { downloadSampleCSV, exportToCSV, importFromFile } from '@/utils/exportUtils';
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
  try {
    // Use the improved importFromFile function
    const importedData = await importFromFile(file);
    
    const investments: GoldInvestment[] = importedData.map((row: any) => {
      // Parse numeric values properly
      const quantity = parseFloat(row['Quantity'] || 0);
      const purchasePrice = parseFloat(row['Purchase Price'] || 0);
      const currentPrice = parseFloat(row['Current Price'] || 0);
      const value = parseFloat(row['Value'] || (quantity * currentPrice));
      
      const investment: GoldInvestment = {
        id: uuidv4(),
        type: String(row['Type'] || ''),
        quantity: quantity,
        purchaseDate: new Date(row['Purchase Date'] || new Date()),
        purchasePrice: purchasePrice,
        currentPrice: currentPrice,
        value: value,
        location: String(row['Location/Notes'] || ''),
        familyMemberId: String(row['Family Member ID'] || ''),
        lastUpdated: new Date()
      };
      
      // Import each investment and create audit record
      addGold(investment);
      createAuditRecord(investment.id, 'gold', 'import', investment);
      
      return investment;
    });
    
    return investments;
  } catch (error) {
    console.error("Error importing gold investments:", error);
    throw error;
  }
};
