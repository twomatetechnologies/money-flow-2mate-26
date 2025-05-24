import React, { useEffect, useState } from 'react';
import { StockHolding } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Import, AlertCircle, FileText, Download } from 'lucide-react';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from '@/hooks/use-toast';
import { useSettings } from '@/contexts/SettingsContext';
import StockForm from '@/components/stocks/StockForm';
import StockImport from '@/components/stocks/StockImport';
import { StockStats } from '@/components/stocks/StockStats';
import { StockTable } from '@/components/stocks/StockTable';
import { MarketIndices } from '@/components/stocks/MarketIndices';
import AuditTrail from '@/components/common/AuditTrail';
import { getStockById, createStock, updateStock, deleteStock } from '@/services/stockService';
import { getAuditRecordsForEntity } from '@/services/auditService';
import { AuditRecord } from '@/types/audit';
import SortButton, { SortDirection, SortOption } from '@/components/common/SortButton';
import FilterButton, { FilterOption } from '@/components/common/FilterButton';
import { useStocks } from '@/hooks/useStocks';
import * as XLSX from 'xlsx';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { handleError, ErrorOptions } from '@/utils/errorHandler';
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
        finalToastSeverity = "high"; // Set to high if any server-side failures occurred
      } else if (importedCount === 0 && validStocks.length > 0) {
        // This case implies all valid stocks failed server-side, which should be caught by failedImports.length > 0
        // However, as a safeguard:
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

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-gray-100 p-3 mb-4 dark:bg-gray-700">
        <AlertCircle className="h-6 w-6 text-gray-400 dark:text-gray-500" />
      </div>
      <h3 className="text-lg font-medium mb-2 text-gray-800 dark:text-gray-200">No Stocks Found</h3>
      <p className="text-muted-foreground max-w-md mb-6">
        Your stock portfolio is empty. Add your first stock or import your portfolio to get started.
      </p>
      <div className="flex gap-2">
        <Button onClick={handleAddStock} className="h-8 text-xs">
          <Plus className="mr-1 h-3 w-3" /> Add Stock
        </Button>
        <Button variant="outline" onClick={handleImportClick} className="h-8 text-xs">
          <Import className="mr-1 h-3 w-3" /> Import Portfolio
        </Button>
      </div>
    </div>
  );

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
        
        <EmptyState />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800 mb-2">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">Stock Portfolio</h1>
          <p className="text-sm text-muted-foreground">
            Manage and track your stock investments
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={handleImportClick} className="h-8 text-xs">
            <Import className="mr-1 h-3 w-3" /> Import
          </Button>
          <Button size="sm" onClick={handleAddStock} className="h-8 text-xs bg-primary hover:bg-primary/90">
            <Plus className="mr-1 h-3 w-3" /> Add Stock
          </Button>
        </div>
      </div>

      {safeStocks.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {/* First row: Stats cards */}
          <div className="grid grid-cols-1 gap-3">
            <StockStats displayedStocks={safeDisplayedStocks} />
          </div>

          {/* Second row: Market Indices */}
          <div className="grid grid-cols-1 gap-3">
            <MarketIndices />
          </div>

          {/* Third row: Stock table */}
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

      <StockForm 
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmitStock}
        initialData={currentStock || undefined}
        mode={formMode}
      />

      <StockImport
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImport={handleImportStocks}
      />

      <AlertDialog 
        open={!!stockToDelete} 
        onOpenChange={(open) => !open && setStockToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete {stockToDelete?.name} ({stockToDelete?.symbol}) from your portfolio. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isAuditOpen} onOpenChange={setIsAuditOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Audit Trail</DialogTitle>
            <DialogDescription>
              View the history of changes for this stock
            </DialogDescription>
          </DialogHeader>
          <AuditTrail records={auditRecords} entityType="stock" />
        </DialogContent>
      </Dialog>
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
