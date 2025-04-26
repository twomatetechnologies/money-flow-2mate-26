
import React, { useEffect, useState } from 'react';
import { StockHolding } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { TrendingUp, TrendingDown, Plus, Pencil, Trash, History, Eye, Import } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import AuditTrail from '@/components/common/AuditTrail';
import { getStocks, createStock, updateStock, deleteStock, getStockById } from '@/services/crudService';
import { startStockPriceMonitoring, simulateStockPriceUpdates } from '@/services/stockPriceService';
import { getAuditRecordsForEntity } from '@/services/auditService';
import { AuditRecord } from '@/types/audit';
import SortButton, { SortDirection, SortOption } from '@/components/common/SortButton';
import FilterButton, { FilterOption } from '@/components/common/FilterButton';
import FamilyMemberDisplay from '@/components/common/FamilyMemberDisplay';
import * as XLSX from 'xlsx';

const Stocks = () => {
  const [stocks, setStocks] = useState<StockHolding[]>([]);
  const [displayedStocks, setDisplayedStocks] = useState<StockHolding[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [currentStock, setCurrentStock] = useState<StockHolding | null>(null);
  const [stockToDelete, setStockToDelete] = useState<StockHolding | null>(null);
  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [auditRecords, setAuditRecords] = useState<AuditRecord[]>([]);
  const { toast } = useToast();
  const { settings } = useSettings();
  
  // Add the missing state variables for sorting and filtering
  const [currentSort, setCurrentSort] = useState<string | null>(null);
  const [currentDirection, setCurrentDirection] = useState<SortDirection>(null);
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
  const [filterOptions, setFilterOptions] = useState<FilterOption[]>([]);

  const sortOptions: SortOption[] = [
    { label: 'Symbol', value: 'symbol' },
    { label: 'Name', value: 'name' },
    { label: 'Quantity', value: 'quantity' },
    { label: 'Current Price', value: 'currentPrice' },
    { label: 'Value', value: 'value' },
    { label: 'Gain/Loss %', value: 'gainPercent' },
  ];

  const fetchStocks = async () => {
    try {
      const data = await getStocks();
      setStocks(data);
      setDisplayedStocks(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching stocks:', error);
      setLoading(false);
      toast({
        title: "Error",
        description: "Failed to load stocks data",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchStocks();
    
    let stopMonitoringFn: (() => void) | undefined;
    
    (async () => {
      try {
        stopMonitoringFn = await startStockPriceMonitoring(settings.stockPriceAlertThreshold);
        console.log("Using real market data for stock prices");
      } catch (error) {
        console.error('Error starting real stock monitoring, falling back to simulation:', error);
        stopMonitoringFn = await simulateStockPriceUpdates(settings.stockPriceAlertThreshold);
        console.log("Using simulated market data for stock prices");
        
        toast({
          title: "Using Simulated Data",
          description: "Could not connect to live market data. Using simulated stock prices instead.",
          variant: "destructive",
        });
      }
    })();
    
    return () => {
      if (typeof stopMonitoringFn === 'function') {
        stopMonitoringFn();
      }
    };
  }, [settings.stockPriceAlertThreshold]);

  useEffect(() => {
    applyFiltersAndSort();
  }, [stocks, currentSort, currentDirection, activeFilters]);

  useEffect(() => {
    if (stocks.length > 0) {
      setFilterOptions([
        {
          id: 'performanceFilter',
          label: 'Performance',
          type: 'select',
          options: [
            { value: 'gainers', label: 'Gainers' },
            { value: 'losers', label: 'Losers' },
          ]
        }
      ]);
    }
  }, [stocks]);

  const [filterOptions, setFilterOptions] = useState<FilterOption[]>([]);

  const totalValue = displayedStocks.reduce((sum, stock) => sum + stock.value, 0);
  const totalInvestment = displayedStocks.reduce(
    (sum, stock) => sum + stock.averageBuyPrice * stock.quantity,
    0
  );
  const totalGain = totalValue - totalInvestment;
  const percentGain = totalInvestment > 0 ? (totalGain / totalInvestment) * 100 : 0;

  const handleAddStock = () => {
    setFormMode('create');
    setCurrentStock(null);
    setIsFormOpen(true);
  };

  const handleEditStock = (stock: StockHolding) => {
    setFormMode('edit');
    setCurrentStock(stock);
    setIsFormOpen(true);
  };

  const handleSubmitStock = async (stockData: Partial<StockHolding>) => {
    try {
      if (formMode === 'create') {
        await createStock(stockData as Omit<StockHolding, 'id' | 'lastUpdated'>);
        toast({
          title: "Success",
          description: "Stock added successfully",
        });
      } else if (currentStock) {
        await updateStock(currentStock.id, stockData);
        toast({
          title: "Success",
          description: "Stock updated successfully",
        });
      }
      fetchStocks();
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
      const importedCount = stocksToImport.length;
      
      for (const stock of stocksToImport) {
        await createStock(stock as Omit<StockHolding, 'id' | 'lastUpdated'>);
      }
      
      fetchStocks();
      setIsImportOpen(false);
      
      toast({
        title: "Success",
        description: `Successfully imported ${importedCount} stocks`,
      });
    } catch (error) {
      console.error('Error importing stocks:', error);
      toast({
        title: "Error",
        description: "Failed to import stocks",
        variant: "destructive"
      });
    }
  };

  const handleDeleteClick = (stock: StockHolding) => {
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
    try {
      const records = await getAuditRecordsForEntity(stockId);
      setAuditRecords(records);
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

  const handleSortChange = (sortKey: string, direction: SortDirection) => {
    setCurrentSort(direction ? sortKey : null);
    setCurrentDirection(direction);
  };

  const handleFilterChange = (filterId: string, value: any) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterId]: value
    }));
  };

  const handleClearFilters = () => {
    setActiveFilters({});
  };

  const calculateGainPercent = (stock: StockHolding) => {
    return ((stock.currentPrice - stock.averageBuyPrice) / stock.averageBuyPrice) * 100;
  };

  const applyFiltersAndSort = () => {
    let result = [...stocks];
    
    if (Object.keys(activeFilters).length > 0) {
      Object.entries(activeFilters).forEach(([key, value]) => {
        if (value) {
          if (key === 'performanceFilter') {
            if (value === 'gainers') {
              result = result.filter(stock => 
                calculateGainPercent(stock) > 0
              );
            } else if (value === 'losers') {
              result = result.filter(stock => 
                calculateGainPercent(stock) < 0
              );
            }
          }
        }
      });
    }
    
    if (currentSort && currentDirection) {
      result.sort((a, b) => {
        let aValue, bValue;
        
        if (currentSort === 'gainPercent') {
          aValue = calculateGainPercent(a);
          bValue = calculateGainPercent(b);
        } else {
          aValue = a[currentSort as keyof StockHolding];
          bValue = b[currentSort as keyof StockHolding];
        }
        
        if (aValue < bValue) return currentDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return currentDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }
    
    setDisplayedStocks(result);
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

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-lg">Loading stocks data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Stock Portfolio</h1>
          <p className="text-muted-foreground">
            Manage and track your stock investments
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleImportClick}>
            <Import className="mr-2 h-4 w-4" /> Import
          </Button>
          <Button onClick={handleAddStock}>
            <Plus className="mr-2 h-4 w-4" /> Add Stock
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="finance-card">
          <CardHeader className="pb-2">
            <CardTitle>Current Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="stat-value">₹{totalValue.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card className="finance-card">
          <CardHeader className="pb-2">
            <CardTitle>Total Investment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="stat-value">₹{totalInvestment.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card className="finance-card">
          <CardHeader className="pb-2">
            <CardTitle>Total Gain/Loss</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`stat-value ${totalGain >= 0 ? 'trend-up' : 'trend-down'}`}>
              {totalGain >= 0 ? '+' : ''}₹{totalGain.toLocaleString()} ({percentGain.toFixed(2)}%)
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="finance-card">
        <CardHeader>
          <CardTitle>Your Stocks</CardTitle>
          <div className="flex items-center gap-2 mt-2">
            <FilterButton 
              options={filterOptions} 
              activeFilters={activeFilters}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
            />
            <SortButton 
              options={sortOptions}
              currentSort={currentSort}
              currentDirection={currentDirection}
              onSortChange={handleSortChange}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableCaption>Your stock portfolio as of today</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Symbol</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Avg. Buy Price</TableHead>
                <TableHead className="text-right">Current Price</TableHead>
                <TableHead className="text-right">Change</TableHead>
                <TableHead className="text-right">Value</TableHead>
                <TableHead className="text-right">Gain/Loss</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedStocks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-6 text-muted-foreground">
                    No stocks found with the current filters
                  </TableCell>
                </TableRow>
              ) : (
                displayedStocks.map((stock) => {
                  const gain = (stock.currentPrice - stock.averageBuyPrice) * stock.quantity;
                  const gainPercent = (gain / (stock.averageBuyPrice * stock.quantity)) * 100;
                  
                  return (
                    <TableRow key={stock.id}>
                      <TableCell className="font-medium">{stock.symbol}</TableCell>
                      <TableCell>{stock.name}</TableCell>
                      <TableCell className="text-right">{stock.quantity}</TableCell>
                      <TableCell className="text-right">₹{stock.averageBuyPrice.toLocaleString()}</TableCell>
                      <TableCell className="text-right">₹{stock.currentPrice.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end">
                          {stock.changePercent >= 0 ? (
                            <TrendingUp className="h-4 w-4 mr-1 trend-up" />
                          ) : (
                            <TrendingDown className="h-4 w-4 mr-1 trend-down" />
                          )}
                          <span className={stock.changePercent >= 0 ? 'trend-up' : 'trend-down'}>
                            {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">₹{stock.value.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <span className={gain >= 0 ? 'trend-up' : 'trend-down'}>
                          {gain >= 0 ? '+' : ''}₹{gain.toLocaleString()} ({gainPercent.toFixed(2)}%)
                        </span>
                      </TableCell>
                      <TableCell><FamilyMemberDisplay memberId={stock.familyMemberId} /></TableCell>
                      <TableCell>
                        <div className="flex justify-center space-x-2">
                          <Button variant="outline" size="icon" onClick={() => handleEditStock(stock)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="icon" onClick={() => handleDeleteClick(stock)}>
                            <Trash className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="icon" onClick={() => handleViewAudit(stock.id)}>
                            <History className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

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

      <AlertDialog open={!!stockToDelete} onOpenChange={(open) => !open && setStockToDelete(null)}>
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
