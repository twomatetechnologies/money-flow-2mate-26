
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { StockHolding } from '@/types';
import { Import, FileText, FileSpreadsheet, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import { importFromFile } from '@/utils/exportUtils';

interface StockImportProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (stocks: Partial<StockHolding>[]) => void;
}

// Define ParsedStock interface to resolve type errors
interface ParsedStock {
  symbol: string;
  name: string;
  currentPrice: number;
  change: number;
  prevClose: number;
  volume: number;
  quantity: number;
  averageBuyPrice: number;
  investmentDate: string;
  investmentAmount: number;
  intraHighLow: string;
  weekHighLow: string;
  todaysGain: number;
  todaysGainPercent: number;
  overallGain: number;
  overallGainPercent: number;
  value: number;
  broker: string;
  notes: string;
}

const StockImport: React.FC<StockImportProps> = ({ isOpen, onClose, onImport }) => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<ParsedStock[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{row: number, errors: string[]}[]>([]);
  const [showDetailedErrors, setShowDetailedErrors] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError(null);
      setValidationErrors([]);
      parseFile(e.target.files[0]);
    }
  };

  const parseFile = async (file: File) => {
    setIsLoading(true);
    setError(null);
    setValidationErrors([]);
    
    try {
      // Use the improved importFromFile function from exportUtils
      if (file.name.endsWith('.csv') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        const importedData = await importFromFile(file);
        
        if (!Array.isArray(importedData) || importedData.length === 0) {
          throw new Error('No data found in the file or invalid file format');
        }

        // Validate each row for required fields
        const requiredFields = ['Symbol', 'symbol', 'Quantity', 'quantity', 'Average Buy Price', 'averageBuyPrice'];
        const errors: {row: number, errors: string[]}[] = [];
        
        // Convert the imported data to ParsedStock format
        const parsedStocks = importedData.map((row: any, index: number) => {
          const rowErrors: string[] = [];
          
          // Check for symbol
          const symbol = String(row['Symbol'] || row['symbol'] || '').trim();
          if (!symbol) {
            rowErrors.push('Symbol is required');
          }
          
          // Check for quantity
          const quantityValue = row['Quantity'] || row['quantity'];
          const quantity = typeof quantityValue === 'number' ? quantityValue : parseFloat(String(quantityValue || '0'));
          if (isNaN(quantity) || quantity <= 0) {
            rowErrors.push('Quantity must be a positive number');
          }
          
          // Check for average buy price
          const avgBuyPriceValue = row['Average Buy Price'] || row['averageBuyPrice'];
          const averageBuyPrice = typeof avgBuyPriceValue === 'number' ? avgBuyPriceValue : parseFloat(String(avgBuyPriceValue || '0'));
          if (isNaN(averageBuyPrice) || averageBuyPrice <= 0) {
            rowErrors.push('Average Buy Price must be a positive number');
          }
          
          // If there are errors, add them to the error list
          if (rowErrors.length > 0) {
            errors.push({
              row: index + 1, // +1 because we're 0-indexed but users expect 1-indexed
              errors: rowErrors
            });
          }
          
          return {
            symbol: symbol,
            name: String(row['Name'] || row['name'] || row['Symbol'] || row['symbol'] || ''),
            currentPrice: parseFloat(String(row['Current Price'] || row['currentPrice'] || 0)),
            change: parseFloat(String(row['Change'] || row['change'] || 0)),
            prevClose: parseFloat(String(row['Prev Close'] || row['prevClose'] || 0)),
            volume: parseFloat(String(row['Volume'] || row['volume'] || 0)),
            quantity: quantity,
            averageBuyPrice: averageBuyPrice,
            investmentDate: String(row['Investment Date'] || row['investmentDate'] || ''),
            investmentAmount: parseFloat(String(row['Investment Amount'] || row['investmentAmount'] || 0)),
            intraHighLow: String(row['Intra High/Low'] || row['intraHighLow'] || ''),
            weekHighLow: String(row['52 Week High/Low'] || row['weekHighLow'] || ''),
            todaysGain: parseFloat(String(row['Today\'s Gain'] || row['todaysGain'] || 0)),
            todaysGainPercent: parseFloat(String(row['Today\'s Gain %'] || row['todaysGainPercent'] || 0)),
            overallGain: parseFloat(String(row['Overall Gain'] || row['overallGain'] || 0)),
            overallGainPercent: parseFloat(String(row['Overall Gain %'] || row['overallGainPercent'] || 0)),
            value: parseFloat(String(row['Value'] || row['value'] || 0)),
            broker: String(row['Broker'] || row['broker'] || ''),
            notes: String(row['Notes'] || row['notes'] || '')
          };
        });
        
        if (errors.length > 0) {
          setValidationErrors(errors);
          const totalErrors = errors.reduce((sum, row) => sum + row.errors.length, 0);
          setError(`Found ${totalErrors} validation error${totalErrors !== 1 ? 's' : ''} in ${errors.length} row${errors.length !== 1 ? 's' : ''}. Please fix them before importing.`);
        } else {
          setPreviewData(parsedStocks);
        }
      } else {
        throw new Error('Unsupported file format. Please upload a CSV or Excel file.');
      }
      
      setIsLoading(false);
    } catch (err) {
      console.error('Error parsing file:', err);
      setError(`Failed to parse file: ${err instanceof Error ? err.message : 'Unknown error'}. Please check the format and try again.`);
      setIsLoading(false);
    }
  };

  const handleImport = () => {
    if (previewData.length === 0) {
      setError('No valid data to import.');
      return;
    }

    const stocksToImport = previewData.map(stock => ({
      symbol: stock.symbol,
      name: stock.name,
      quantity: stock.quantity,
      averageBuyPrice: stock.averageBuyPrice,
      currentPrice: stock.currentPrice || stock.averageBuyPrice, // Default to averageBuyPrice if currentPrice is not provided
      change: stock.change,
      changePercent: stock.todaysGainPercent,
      value: stock.value || (stock.quantity * (stock.currentPrice || stock.averageBuyPrice)),
      sector: '',
      lastUpdated: new Date(),
      notes: stock.notes
    }));

    onImport(stocksToImport);
    setFile(null);
    setPreviewData([]);
    setValidationErrors([]);
  };

  const downloadSampleFile = (format: 'csv' | 'xlsx') => {
    const sampleData = [
      ['Symbol', 'Name', 'Quantity', 'Average Buy Price', 'Current Price', 'Notes'],
      ['AAPL', 'Apple Inc.', 10, 150.25, 175.50, 'Long term investment'],
      ['MSFT', 'Microsoft Corporation', 5, 280.75, 300.25, 'Tech sector'],
      ['GOOGL', 'Alphabet Inc.', 2, 2750.00, 2850.75, 'Growth stock'],
      ['AMZN', 'Amazon.com Inc.', 3, 3300.50, 3450.25, 'E-commerce leader']
    ];

    if (format === 'csv') {
      const csvContent = sampleData.map(row => row.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'sample_stocks.csv';
      link.click();
    } else {
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(sampleData);
      XLSX.utils.book_append_sheet(wb, ws, 'Sample Stocks');
      XLSX.writeFile(wb, 'sample_stocks.xlsx');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Stocks</DialogTitle>
          <DialogDescription>
            Upload a CSV or Excel file with your stock holdings to import them into your portfolio.
            Download a sample file to see the required format.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-4 mb-4">
          <Button 
            variant="outline" 
            onClick={() => downloadSampleFile('csv')}
            className="flex items-center"
          >
            <FileText className="mr-2 h-4 w-4" />
            Download Sample CSV
          </Button>
          <Button 
            variant="outline" 
            onClick={() => downloadSampleFile('xlsx')}
            className="flex items-center"
          >
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Download Sample Excel
          </Button>
        </div>

        <div className="space-y-4">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              className="cursor-pointer"
            />
            <p className="text-xs text-muted-foreground">
              Supported formats: .csv, .xlsx, .xls
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Import Error</AlertTitle>
              <AlertDescription className="space-y-2">
                <p>{error}</p>
                {validationErrors.length > 0 && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowDetailedErrors(!showDetailedErrors)}
                    className="text-xs mt-1"
                  >
                    {showDetailedErrors ? 'Hide Details' : 'Show Details'}
                  </Button>
                )}
              </AlertDescription>
              
              {showDetailedErrors && validationErrors.length > 0 && (
                <div className="mt-4 max-h-[200px] overflow-y-auto text-sm border rounded-md p-2">
                  <ul className="list-disc pl-4">
                    {validationErrors.map((rowError, idx) => (
                      <li key={idx} className="mb-2">
                        <strong>Row {rowError.row}:</strong>
                        <ul className="list-disc pl-6">
                          {rowError.errors.map((err, errIdx) => (
                            <li key={errIdx}>{err}</li>
                          ))}
                        </ul>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Alert>
          )}

          {previewData.length > 0 && (
            <div className="border rounded-md p-4">
              <h3 className="font-semibold mb-2">Preview ({previewData.length} stocks found)</h3>
              <div className="overflow-auto max-h-[300px]">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2 px-2 text-left">Symbol</th>
                      <th className="py-2 px-2 text-left">Name</th>
                      <th className="py-2 px-2 text-right">Quantity</th>
                      <th className="py-2 px-2 text-right">Avg. Buy Price</th>
                      <th className="py-2 px-2 text-right">Current Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.map((stock, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-2 px-2">{stock.symbol}</td>
                        <td className="py-2 px-2">{stock.name}</td>
                        <td className="py-2 px-2 text-right">{stock.quantity}</td>
                        <td className="py-2 px-2 text-right">₹{stock.averageBuyPrice.toFixed(2)}</td>
                        <td className="py-2 px-2 text-right">₹{stock.currentPrice.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            onClick={handleImport} 
            disabled={previewData.length === 0 || isLoading}
            className="ml-2"
          >
            <Import className="mr-2 h-4 w-4" />
            Import {previewData.length} Stocks
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StockImport;
