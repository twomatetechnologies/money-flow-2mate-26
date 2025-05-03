
import React, { useEffect, useState } from 'react';
import { StockHolding } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Import } from 'lucide-react';
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
import AuditTrail from '@/components/common/AuditTrail';
import { getStockById, createStock, updateStock, deleteStock } from '@/services/crudService';
import { getAuditRecordsForEntity } from '@/services/auditService';
import { AuditRecord } from '@/types/audit';
import SortButton, { SortDirection, SortOption } from '@/components/common/SortButton';
import FilterButton, { FilterOption } from '@/components/common/FilterButton';
import { useStocks } from '@/hooks/useStocks';
import * as XLSX from 'xlsx';

const Stocks = () => {
  const {
    stocks,
    displayedStocks,
    loading,
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
  const uniqueSectors = Array.from(new Set(stocks.filter(s => s.sector).map(s => s.sector)));
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

      <StockStats displayedStocks={displayedStocks} />

      <Card className="finance-card">
        <CardHeader>
          <CardTitle>Your Stocks</CardTitle>
          <div className="flex items-center gap-2 mt-2">
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
        </CardHeader>
        <CardContent>
          <StockTable 
            stocks={displayedStocks}
            onEdit={handleEditStock}
            onDelete={handleDeleteClick}
            onViewAudit={handleViewAudit}
            onSortChange={handleTableSortChange}
            currentSort={currentSort}
            currentDirection={currentDirection}
          />
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
