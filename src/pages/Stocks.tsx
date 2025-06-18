import React, { useState } from 'react';
import { StockHolding } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, FileText, Download } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from '@/hooks/use-toast';
import StocksPageHeader from '@/components/stocks/StocksPageHeader';
import StocksEmptyState from '@/components/stocks/StocksEmptyState';
import StockFormDialog from '@/components/stocks/StockFormDialog';
import StockImportDialog from '@/components/stocks/StockImportDialog';
import DeleteStockAlertDialog from '@/components/stocks/DeleteStockAlertDialog';
import AuditTrailDialog from '@/components/stocks/AuditTrailDialog';

import { StockStats } from '@/components/stocks/StockStats';
import { StockTable } from '@/components/stocks/StockTable';
import { MarketIndices } from '@/components/stocks/MarketIndices';
import { createStock, updateStock, deleteStock } from '@/services/stockService';
import { getAuditRecordsForEntity } from '@/services/auditService';
import { AuditRecord } from '@/types/audit';
import SortButton, { SortDirection, SortOption } from '@/components/common/SortButton';
import FilterButton, { FilterOption } from '@/components/common/FilterButton';
import { useStocks } from '@/hooks/useStocks';
import * as XLSX from 'xlsx';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { handleError } from '@/utils/errorHandler';
import { exportToCSV, exportToExcel } from '@/utils/exportUtils';

const Stocks = () => {
  const {
    stocks,
    displayedStocks,
    loading,
    error: stocksHookError,
    currentSort,
    currentDirection,
    activeFilters,
    setCurrentSort,
    setCurrentDirection,
    setActiveFilters,
    fetchStocks,
    calculateGainPercent
  } = useStocks();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [currentStock, setCurrentStock] = useState<StockHolding | null>(null);
  const [stockToDelete, setStockToDelete] = useState<StockHolding | null>(null);
  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [auditRecords, setAuditRecords] = useState<AuditRecord[]>([]);
  const { toast } = useToast();

  const safeStocks = Array.isArray(stocks) ? stocks : [];
  const safeDisplayedStocks = Array.isArray(displayedStocks) ? displayedStocks : [];

  const filterOptions: FilterOption[] = [
    {
      id: 'performanceFilter',
      label: 'Performance',
      type: 'select',
      options: [
        { value: 'gainers', label: 'Gainers' },
        { value: 'losers', label: 'Losers' },
      ]
    },
    {
      id: 'searchFilter',
      label: 'Search',
      type: 'search'
    },
    {
      id: 'priceRangeFilter',
      label: 'Price Range (₹)',
      type: 'range'
    },
    {
      id: 'valueRangeFilter',
      label: 'Total Value Range (₹)',
      type: 'range'
    }
  ];

  const uniqueSectors = Array.from(new Set(safeStocks.filter(s => s && s.sector).map(s => s.sector)));
  if (uniqueSectors.length > 0) {
    filterOptions.push({
      id: 'selectedSectors',
      label: 'Sectors',
      type: 'checkbox',
      options: uniqueSectors.map(sector => ({ 
        value: sector as string, 
        label: sector as string 
      }))
    });
  }

  const sortOptions: SortOption[] = [
    { label: 'Symbol', value: 'symbol' },
    { label: 'Name', value: 'name' },
    { label: 'Quantity', value: 'quantity' },
    { label: 'Average Buy Price', value: 'averageBuyPrice' },
    { label: 'Current Price', value: 'currentPrice' },
    { label: 'Value', value: 'value' },
    { label: 'Change %', value: 'changePercent' },
    { label: 'Gain/Loss %', value: 'gainPercent' },
    { label: 'Owner', value: 'familyMemberId' }
  ];

  const handleAddStock = () => {
    setFormMode('create');
    setCurrentStock(null);
    setIsFormOpen(true);
  };

  const handleEditStock = (stock: StockHolding) => {
    if (!stock) return;
    setFormMode('edit');
    setCurrentStock(stock);
    setIsFormOpen(true);
  };

  const handleSubmitStock = async (stockData: Partial<StockHolding>) => {
    try {
      const requiredFields: Array<keyof Pick<StockHolding, 'symbol' | 'name' | 'quantity' | 'averageBuyPrice'>> = ['symbol', 'name', 'quantity', 'averageBuyPrice'];
      const missingFields = requiredFields.filter(field => 
        stockData[field] === undefined || stockData[field] === null || String(stockData[field]).trim() === ''
      );
      
      if (missingFields.length > 0) {
        const missingFieldsMessage = `Missing required fields: ${missingFields.join(', ')}. Please ensure all mandatory fields are filled.`;
        handleError(new Error(missingFieldsMessage), "Validation Error: Incomplete Data", { showToast: true, severity: "high", context: { missingFields, providedData: stockData } });
        return;
      }
      
      const quantity = Number(stockData.quantity);
      if (isNaN(quantity) || quantity <= 0) {
        handleError(new Error("Quantity must be a positive number."), "Validation Error: Invalid Quantity", { showToast: true, severity: "high", context: { quantity: stockData.quantity, providedData: stockData } });
        return;
      }
      const averageBuyPrice = Number(stockData.averageBuyPrice);
      if (isNaN(averageBuyPrice) || averageBuyPrice <= 0) {
        handleError(new Error("Average Buy Price must be a positive number."), "Validation Error: Invalid Price", { showToast: true, severity: "high", context: { averageBuyPrice: stockData.averageBuyPrice, providedData: stockData } });
        return;
      }

      if (formMode === 'create') {
        await createStock(stockData as Omit<StockHolding, 'id' | 'lastUpdated'>);
        toast({
          title: "Success",
          description: `${stockData.name} (${stockData.symbol}) added successfully.`,
        });
      } else if (currentStock?.id) {
        await updateStock(currentStock.id, stockData);
        toast({
          title: "Success",
          description: `${stockData.name} (${stockData.symbol}) updated successfully.`,
        });
      }
      fetchStocks();
      setIsFormOpen(false);
    } catch (error) {
      console.error('Error saving stock:', error);
      const defaultMessage = formMode === 'create' ? "Failed to add stock. Please check details and try again." : "Failed to update stock. Please review changes and retry.";
      const errorContext = error instanceof Error ? { originalError: error.message, stack: error.stack } : { errorDetails: String(error) };
      handleError(error, defaultMessage, { showToast: true, severity: "high", context: { ...errorContext, stockData, formMode } });
    }
  };

  const handleImportClick = () => {
    setIsImportOpen(true);
  };

  const handleImportStocks = async (stocksToImport: Partial<StockHolding>[]) => {
    try {
      if (!Array.isArray(stocksToImport) || stocksToImport.length === 0) {
        handleError(new Error("No valid stocks found in the imported file. The file might be empty or incorrectly formatted. Ensure columns like 'Symbol', 'Name', 'Quantity', and 'Average Buy Price' are present and correctly filled."), "Import Error: No Data", { showToast: true, severity: "high" });
        return;
      }

      const requiredFields: Array<keyof Pick<StockHolding, 'symbol' | 'name' | 'quantity' | 'averageBuyPrice'>> = ['symbol', 'name', 'quantity', 'averageBuyPrice'];
      
      let validStocks: Partial<StockHolding>[] = [];
      let invalidStocksInfo: { stock: Partial<StockHolding>, missing: string[], reason: string }[] = [];
      
      stocksToImport.forEach((stock, index) => {
        if (stock && Object.keys(stock).length > 0) { // Check if stock is not null and not an empty object
          const missing: string[] = [];
          let reason = "";
          let specificIssues: string[] = [];

          requiredFields.forEach(field => {
            if (stock[field] === undefined || stock[field] === null || String(stock[field]).trim() === '') {
              missing.push(field.toString());
            }
          });
           if (missing.length > 0) {
            reason = `Missing required fields: ${missing.join(', ')}.`;
           }

          const quantity = Number(stock.quantity);
          const avgBuyPrice = Number(stock.averageBuyPrice);
            
          if (stock.quantity !== undefined && (isNaN(quantity) || quantity <= 0)) {
            specificIssues.push('Quantity must be a positive number');
          }
          if (stock.averageBuyPrice !== undefined && (isNaN(avgBuyPrice) || avgBuyPrice <= 0)) {
            specificIssues.push('Average Buy Price must be a positive number');
          }

          if (specificIssues.length > 0) {
            reason = reason ? `${reason} ${specificIssues.join('; ')}.` : `${specificIssues.join('; ')}.`;
          }

          if (missing.length === 0 && specificIssues.length === 0) {
            validStocks.push({
              ...stock,
              symbol: String(stock.symbol!).toUpperCase(),
              name: String(stock.name!),
              quantity: quantity,
              averageBuyPrice: avgBuyPrice,
              currentPrice: Number(stock.currentPrice) || avgBuyPrice,
              value: stock.value || (quantity * (Number(stock.currentPrice) || avgBuyPrice)),
              change: Number(stock.change) || 0,
              changePercent: Number(stock.changePercent) || 0,
              sector: stock.sector || 'Unspecified'
            });
          } else {
            invalidStocksInfo.push({ stock: stock || { symbol: `Row ${index + 1}`}, missing: [...missing, ...specificIssues], reason: reason || "Unknown validation issue." });
          }
        } else {
           invalidStocksInfo.push({ stock: {symbol: `Row ${index + 1} (Empty)`}, missing: ['all data'], reason: 'Empty row or invalid stock object in file.' });
        }
      });
      
      if (invalidStocksInfo.length > 0) {
        const detailedErrors = invalidStocksInfo.map(info => 
          `Stock (Symbol: ${info.stock.symbol || 'N/A'}, Name: ${info.stock.name || 'N/A'}) - Issue: ${info.reason || info.missing.join(', ')}`
        ).join('; \n');
        toast({
          title: `Import Warning: ${invalidStocksInfo.length} stocks have validation issues`,
          description: `The following stocks will be skipped: \n${detailedErrors}`,
          variant: "default", 
          duration: 15000, 
        });
      }
      
      if (validStocks.length === 0) {
        const errorMessage = invalidStocksInfo.length > 0 
          ? `No stocks passed validation. Common issues: missing fields (Symbol, Name, Quantity, Average Buy Price) or invalid numeric values (Quantity and Average Buy Price must be positive). ${invalidStocksInfo.length} stocks had issues. Please check the warning toast for details and correct your file.`
          : "No processable stocks found in the file. Ensure the file is not empty and contains valid stock data with all required fields.";
        handleError(new Error(errorMessage), "Import Error: All Stocks Invalid or Unprocessable", { showToast: true, severity: "high", context: { invalidCount: invalidStocksInfo.length, totalAttempted: stocksToImport.length, exampleIssue: invalidStocksInfo[0]?.reason } });
        return;
      }
      
      console.log('Importing valid stocks:', validStocks);
      
      let importedCount = 0;
      let failedImports: {stock: Partial<StockHolding>, error: any, errorMessage: string}[] = [];

      for (const stock of validStocks) {
        try {
          await createStock(stock as Omit<StockHolding, 'id' | 'lastUpdated'>);
          importedCount++;
        } catch (error) {
          console.error('Error importing stock during createStock call:', stock, error);
          const extractedMsg = extractErrorMessage(error, `Failed to import ${stock.symbol || 'stock'}. Check data validity.`);
          failedImports.push({stock, error, errorMessage: extractedMsg});
        }
      }
      
      fetchStocks();
      setIsImportOpen(false);
      
      let finalMessage = `Successfully imported ${importedCount} of ${validStocks.length} processed stocks.`;
      let finalToastSeverity: "default" | "high" = "default";

      if (failedImports.length > 0) {
        const failedDetails = failedImports.map(f => `${f.stock.symbol || 'Unknown'}: ${f.errorMessage}`).join('; ');
        finalMessage += ` ${failedImports.length} stocks failed to import due to server-side issues or data conflicts: ${failedDetails}. Check console for detailed logs.`;
        finalToastSeverity = "high"; 
      } else if (importedCount === 0 && validStocks.length > 0) {
        finalMessage = `All ${validStocks.length} processed stocks failed to import due to server-side issues. Please check console for details.`;
        finalToastSeverity = "high";
      }
      
      toast({
        title: "Import Complete",
        description: finalMessage,
        variant: finalToastSeverity === "high" ? "destructive" : "default" 
      });

    } catch (error) {
      console.error('General error during import process:', error);
      const errorContext = error instanceof Error ? { originalError: error.message, stack: error.stack } : { errorDetails: String(error) };
      handleError(error, "A critical error occurred during the import process. Please try again or check console for details.", { showToast: true, severity: "high", context: errorContext });
    }
  };

  const handleDeleteClick = (stock: StockHolding) => {
    if (!stock) return;
    setStockToDelete(stock);
  };

  const handleConfirmDelete = async () => {
    if (stockToDelete) {
      try {
        await deleteStock(stockToDelete.id);
        toast({
          title: "Success",
          description: "Stock deleted successfully",
        });
        fetchStocks();
      } catch (error) {
        console.error('Error deleting stock:', error);
        const errorContext = error instanceof Error ? { originalError: error.message, stack: error.stack } : { errorDetails: String(error) };
        handleError(error, `Failed to delete stock ${stockToDelete.name}. Please try again.`, { showToast: true, severity: "high", context: { ...errorContext, stockId: stockToDelete.id } });
      }
      setStockToDelete(null);
    }
  };

  const handleViewAudit = async (stockId: string) => {
    if (!stockId) return;
    
    try {
      const records = await getAuditRecordsForEntity(stockId);
      setAuditRecords(Array.isArray(records) ? records : []);
      setIsAuditOpen(true);
    } catch (error) {
      console.error('Error fetching audit records:', error);
      const errorContext = error instanceof Error ? { originalError: error.message, stack: error.stack } : { errorDetails: String(error) };
      handleError(error, "Failed to load audit trail. Please try again.", { showToast: true, severity: "high", context: { ...errorContext, stockId } });
    }
  };

  const downloadSampleFile = (format: 'csv' | 'xlsx') => {
    if (format === 'csv') {
      const link = document.createElement('a');
      link.href = '/sample_stocks.csv';
      link.download = 'sample_stocks.csv';
      link.click();
    } else {
      const workbook = XLSX.utils.book_new();
      const data = [
        ['Symbol', 'Name', 'Quantity', 'Average Buy Price', 'Current Price', 'Sector', 'Notes', 'Family Member ID'],
        ['AAPL', 'Apple Inc.', 10, 150.25, 175.50, 'Technology', 'Long term investment', 'fam-member-optional-id'],
        ['MSFT', 'Microsoft Corporation', 5, 280.75, 300.25, 'Technology', 'Tech sector', ''],
        ['GOOGL', 'Alphabet Inc.', 2, 2750.00, 2850.75, 'Technology','Growth stock', ''],
        ['AMZN', 'Amazon.com Inc.', 3, 3300.50, 3450.25, 'Consumer Discretionary', 'E-commerce leader', '']
      ];
      const worksheet = XLSX.utils.aoa_to_sheet(data);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sample Stocks');
      XLSX.writeFile(workbook, 'sample_stocks.xlsx');
    }
  };

  const handleTableSortChange = (field: string, direction: SortDirection) => {
    setCurrentSort(direction ? field : null);
    setCurrentDirection(direction);
  };

  const getExportableStockData = () => {
    return safeDisplayedStocks.map(stock => {
      const gain = (stock.value || 0) - ((stock.averageBuyPrice || 0) * (stock.quantity || 0));
      const gainPercent = calculateGainPercent(stock);
      return {
        'Symbol': stock.symbol,
        'Name': stock.name,
        'Quantity': stock.quantity,
        'Avg. Buy Price (₹)': stock.averageBuyPrice,
        'Current Price (₹)': stock.currentPrice,
        'Daily Change (%)': stock.changePercent,
        'Total Value (₹)': stock.value,
        'Total Gain/Loss (₹)': gain,
        'Total Gain/Loss (%)': gainPercent,
        'Sector': stock.sector,
        'Owner ID': stock.familyMemberId,
        'Last Updated': stock.lastUpdated ? new Date(stock.lastUpdated).toLocaleDateString() : '',
      };
    });
  };

  const handleExportCSV = () => {
    const dataToExport = getExportableStockData();
    if (dataToExport.length === 0) {
      toast({ title: "No Data", description: "There is no data to export.", variant: "default" });
      return;
    }
    exportToCSV(dataToExport, 'stock_portfolio');
    toast({ title: "Export Successful", description: "Stock portfolio exported as CSV." });
  };

  const handleExportExcel = () => {
    const dataToExport = getExportableStockData();
    if (dataToExport.length === 0) {
      toast({ title: "No Data", description: "There is no data to export.", variant: "default" });
      return;
    }
    exportToExcel(dataToExport, 'stock_portfolio');
    toast({ title: "Export Successful", description: "Stock portfolio exported as Excel." });
  };

  // Function to manually update stock prices
  const handleRefreshPrices = async () => {
    try {
      // Show a loading toast
      toast({
        title: "Refreshing Prices",
        description: "Fetching the latest stock prices...",
      });
      
      // Extract all symbols from stocks
      const symbols = safeStocks.map(stock => stock.symbol);
      
      console.log('Refreshing prices for symbols:', symbols);
      
      if (symbols.length === 0) {
        toast({
          title: "No Stocks Found",
          description: "Add stocks to your portfolio first.",
          variant: "default",
        });
        return;
      }
      
      // Use our price service to fetch updated prices (this is a direct call, not the interval based one)
      const response = await fetch('/api/stocks/refresh-prices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ symbols }),
      });
      
      const batchPricesResponse = await response.json();
      console.log('Refresh response from API:', batchPricesResponse);
      
      if (!batchPricesResponse || !batchPricesResponse.prices || Object.keys(batchPricesResponse.prices).length === 0) {
        toast({
          title: "Update Failed",
          description: "Could not fetch latest prices. API limit may have been reached.",
          variant: "destructive",
        });
        return;
      }
      
      // Count how many prices were successfully updated
      const updatedCount = batchPricesResponse.updated || 0;
      
      // Refresh the stock list to show updated prices
      await fetchStocks();
      
      // Show success message
      toast({
        title: "Prices Updated",
        description: `Successfully updated ${updatedCount} of ${symbols.length} stock prices.`,
        variant: updatedCount === 0 ? "destructive" : "default",
      });
    } catch (error) {
      console.error('Error refreshing stock prices:', error);
      toast({
        title: "Error",
        description: "Failed to refresh stock prices. Please try again later.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-pulse rounded-full bg-gray-200 dark:bg-gray-700 h-12 w-12 mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-800 dark:text-gray-200">Loading stocks data...</p>
          <p className="text-sm text-muted-foreground mt-2">This may take a moment</p>
        </div>
      </div>
    );
  }

  if (stocksHookError) {
    return (
      <div className="py-6">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4 mr-2" />
          <AlertDescription>
            {stocksHookError}. Please try again later or contact support.
          </AlertDescription>
        </Alert>
        
        <Button onClick={fetchStocks} className="mb-6">
          Try Again
        </Button>
        
        <StocksEmptyState onAddStock={handleAddStock} onImportClick={handleImportClick} />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <StocksPageHeader 
        onAddStock={handleAddStock} 
        onImportClick={handleImportClick} 
        onRefreshPrices={handleRefreshPrices}
      />

      {safeStocks.length === 0 ? (
        <StocksEmptyState onAddStock={handleAddStock} onImportClick={handleImportClick} />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3">
            <StockStats displayedStocks={safeDisplayedStocks} />
          </div>

          <div className="grid grid-cols-1 gap-3">
            <MarketIndices />
          </div>

          <Card className="border border-gray-100 dark:border-gray-800 shadow-sm rounded-lg overflow-hidden">
            <CardHeader className="py-2 px-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-900 dark:text-gray-100">Your Stocks</CardTitle>
                <div className="flex items-center gap-2">
                  <FilterButton 
                    options={filterOptions} 
                    activeFilters={activeFilters}
                    onFilterChange={(filterId, value) => setActiveFilters(prev => ({ ...prev, [filterId]: value }))}
                    onClearFilters={() => setActiveFilters({})}
                  />
                  <SortButton 
                    options={sortOptions}
                    currentSort={currentSort}
                    currentDirection={currentDirection}
                    onSortChange={(sortKey, direction) => {
                      setCurrentSort(direction ? sortKey : null);
                      setCurrentDirection(direction);
                    }}
                  />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8 text-xs">
                        <FileText className="mr-1 h-3 w-3" /> Export
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={handleExportCSV}>
                        <Download className="mr-2 h-4 w-4" />
                        Export as CSV
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleExportExcel}>
                        <Download className="mr-2 h-4 w-4" />
                        Export as Excel
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <StockTable 
                stocks={safeDisplayedStocks}
                onEdit={handleEditStock}
                onDelete={handleDeleteClick}
                onViewAudit={handleViewAudit}
                onSortChange={handleTableSortChange}
                currentSort={currentSort}
                currentDirection={currentDirection}
              />
            </CardContent>
          </Card>
        </>
      )}

      <StockFormDialog
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmitStock}
        initialData={currentStock || undefined}
        mode={formMode}
      />

      <StockImportDialog
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImport={handleImportStocks}
      />

      <DeleteStockAlertDialog
        stockToDelete={stockToDelete}
        onOpenChange={(open) => !open && setStockToDelete(null)}
        onConfirmDelete={handleConfirmDelete}
      />
      
      <AuditTrailDialog
        isOpen={isAuditOpen}
        onOpenChange={setIsAuditOpen}
        records={auditRecords}
      />
    </div>
  );
};

function extractErrorMessage(error: unknown, fallbackMessage?: string): string {
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message;
  if (error && typeof error === 'object') {
    if ('message' in error && typeof (error as any).message === 'string') {
      return (error as any).message;
    }
  }
  return fallbackMessage || "An unexpected error occurred";
}

export default Stocks;
