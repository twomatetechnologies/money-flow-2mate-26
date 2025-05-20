import React, { useEffect, useState } from 'react';
import { StockHolding } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Import, AlertCircle } from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';
import { useSettings } from '@/contexts/SettingsContext';
import StockForm from '@/components/stocks/StockForm';
import StockImport from '@/components/stocks/StockImport';
import { StockStats } from '@/components/stocks/StockStats';
import { StockTable } from '@/components/stocks/StockTable';
import { MarketIndices } from '@/components/stocks/MarketIndices';
import AuditTrail from '@/components/common/AuditTrail';
import { getStockById, createStock, updateStock, deleteStock } from '@/services/crudService';
import { getAuditRecordsForEntity } from '@/services/auditService';
import { AuditRecord } from '@/types/audit';
import SortButton, { SortDirection, SortOption } from '@/components/common/SortButton';
import FilterButton, { FilterOption } from '@/components/common/FilterButton';
import { useStocks } from '@/hooks/useStocks';
import * as XLSX from 'xlsx';
import { Alert, AlertDescription } from '@/components/ui/alert';

const Stocks = () => {
  const {
    stocks,
    displayedStocks,
    loading,
    error,
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

  // Ensure we have an array of stocks
  const safeStocks = Array.isArray(stocks) ? stocks : [];
  const safeDisplayedStocks = Array.isArray(displayedStocks) ? displayedStocks : [];

  // Enhanced filter options
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

  // Get all unique sectors from stocks
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
      // Validate required fields
      const requiredFields = ['symbol', 'name', 'quantity', 'averageBuyPrice'] as const;
      const missingFields = requiredFields.filter(field => !stockData[field]);
      
      if (missingFields.length > 0) {
        toast({
          title: "Validation Error",
          description: `Missing required fields: ${missingFields.join(', ')}`,
          variant: "destructive"
        });
        return;
      }

      if (formMode === 'create') {
        await createStock(stockData as Omit<StockHolding, 'id' | 'lastUpdated'>);
        toast({
          title: "Success",
          description: "Stock added successfully",
        });
      } else if (currentStock?.id) {
        await updateStock(currentStock.id, stockData);
        toast({
          title: "Success",
          description: "Stock updated successfully",
        });
      }
      fetchStocks();
      setIsFormOpen(false);
    } catch (error) {
      console.error('Error saving stock:', error);
      toast({
        title: "Error",
        description: "Failed to save stock",
        variant: "destructive"
      });
    }
  };

  const handleImportClick = () => {
    setIsImportOpen(true);
  };

  const handleImportStocks = async (stocksToImport: Partial<StockHolding>[]) => {
    try {
      if (!Array.isArray(stocksToImport) || stocksToImport.length === 0) {
        toast({
          title: "Error",
          description: "No valid stocks to import",
          variant: "destructive"
        });
        return;
      }

      // Validate required fields for each stock
      const requiredFields = ['symbol', 'name', 'quantity', 'averageBuyPrice'] as const;
      
      let validStocks: Partial<StockHolding>[] = [];
      let invalidStocks: Partial<StockHolding>[] = [];
      
      stocksToImport.forEach(stock => {
        if (stock && requiredFields.every(field => {
          const value = stock[field];
          return value !== undefined && value !== null && value !== '';
        })) {
          validStocks.push({
            ...stock,
            // Ensure all required properties have values
            symbol: stock.symbol!,
            name: stock.name!,
            quantity: stock.quantity!,
            averageBuyPrice: stock.averageBuyPrice!,
            currentPrice: stock.currentPrice || stock.averageBuyPrice,
            value: stock.value || (stock.quantity! * (stock.currentPrice || stock.averageBuyPrice!)),
            change: stock.change || 0,
            changePercent: stock.changePercent || 0,
            sector: stock.sector || 'Unspecified'
          });
        } else {
          invalidStocks.push(stock);
        }
      });
      
      if (invalidStocks.length > 0) {
        console.warn('Some stocks are missing required fields:', invalidStocks);
        toast({
          title: "Warning",
          description: `${invalidStocks.length} stocks are missing required fields and will be skipped`,
          variant: "warning"
        });
      }
      
      if (validStocks.length === 0) {
        toast({
          title: "Error",
          description: "No valid stocks to import after validation",
          variant: "destructive"
        });
        return;
      }
      
      console.log('Importing valid stocks:', validStocks);
      
      // Import stocks one by one
      let importedCount = 0;
      for (const stock of validStocks) {
        try {
          await createStock(stock as Omit<StockHolding, 'id' | 'lastUpdated'>);
          importedCount++;
        } catch (error) {
          console.error('Error importing stock:', stock, error);
        }
      }
      
      fetchStocks();
      setIsImportOpen(false);
      
      toast({
        title: "Success",
        description: `Successfully imported ${importedCount} stocks`,
        variant: importedCount < validStocks.length ? "warning" : "default"
      });
    } catch (error) {
      console.error('Error importing stocks:', error);
      toast({
        title: "Error",
        description: "Failed to import stocks. See console for details.",
        variant: "destructive"
      });
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
        toast({
          title: "Error",
          description: "Failed to delete stock",
          variant: "destructive"
        });
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
      toast({
        title: "Error",
        description: "Failed to load audit trail",
        variant: "destructive"
      });
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
        ['Symbol', 'Name', 'Quantity', 'Average Buy Price', 'Current Price', 'Notes'],
        ['AAPL', 'Apple Inc.', 10, 150.25, 175.50, 'Long term investment'],
        ['MSFT', 'Microsoft Corporation', 5, 280.75, 300.25, 'Tech sector'],
        ['GOOGL', 'Alphabet Inc.', 2, 2750.00, 2850.75, 'Growth stock'],
        ['AMZN', 'Amazon.com Inc.', 3, 3300.50, 3450.25, 'E-commerce leader']
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

  // Empty state UI for when there are no stocks
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-gray-100 p-3 mb-4">
        <AlertCircle className="h-6 w-6 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium mb-2">No Stocks Found</h3>
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
          <div className="animate-pulse rounded-full bg-gray-200 h-12 w-12 mx-auto mb-4"></div>
          <p className="text-lg font-medium">Loading stocks data...</p>
          <p className="text-sm text-muted-foreground mt-2">This may take a moment</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-6">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4 mr-2" />
          <AlertDescription>
            {error}. Please try again later or contact support.
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

export default Stocks;
