
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError(null);
      parseFile(e.target.files[0]);
    }
  };

  const parseFile = (file: File) => {
    setIsLoading(true);
    setError(null);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const csvData = event.target?.result as string;
        const parsedStocks = parseCSV(csvData);
        setPreviewData(parsedStocks);
        setIsLoading(false);
      } catch (err) {
        console.error('Error parsing file:', err);
        setError('Failed to parse file. Please check the format and try again.');
        setIsLoading(false);
      }
    };
    
    reader.onerror = () => {
      setError('Error reading file. Please try again.');
      setIsLoading(false);
    };
    
    reader.readAsText(file);
  };

  const parseCSV = (csvData: string): ParsedStock[] => {
    const lines = csvData.split('\n');
    if (lines.length < 2) {
      throw new Error('File has insufficient data.');
    }
    
    // Skip header row and parse data rows
    const stocks = lines.slice(1)
      .filter(line => line.trim().length > 0)
      .map(line => {
        const values = line.split(',').map(value => value.trim());
        if (values.length < 5) {
          throw new Error('Row has insufficient columns.');
        }

        return {
          symbol: values[0] || '',
          name: values[1] || values[0] || '',
          currentPrice: parseFloat(values[1]) || 0,
          change: parseFloat(values[2]) || 0,
          prevClose: parseFloat(values[3]) || 0,
          volume: parseFloat(values[4]) || 0,
          quantity: parseFloat(values[5]) || 0,
          averageBuyPrice: parseFloat(values[6]) || 0,
          investmentDate: values[7] || '',
          investmentAmount: parseFloat(values[8]) || 0,
          intraHighLow: values[9] || '',
          weekHighLow: values[10] || '',
          todaysGain: parseFloat(values[11]) || 0,
          todaysGainPercent: parseFloat(values[12]) || 0,
          overallGain: parseFloat(values[13]) || 0,
          overallGainPercent: parseFloat(values[14]) || 0,
          value: parseFloat(values[15]) || 0,
          broker: values[16] || '',
          notes: values[17] || '',
        };
      });
    
    return stocks;
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
      currentPrice: stock.currentPrice,
      change: stock.change,
      changePercent: stock.todaysGainPercent,
      value: stock.value || (stock.quantity * stock.currentPrice),
      sector: '',
      lastUpdated: new Date(),
      notes: stock.notes
    }));

    onImport(stocksToImport);
    setFile(null);
    setPreviewData([]);
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
              Supported formats: .csv
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
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
                        <td className="py-2 px-2 text-right">₹{stock.averageBuyPrice}</td>
                        <td className="py-2 px-2 text-right">₹{stock.currentPrice}</td>
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
