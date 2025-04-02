
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
import { TrendingUp, TrendingDown, Plus, Pencil, Trash, History, Eye } from 'lucide-react';
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
import StockForm from '@/components/stocks/StockForm';
import AuditTrail from '@/components/common/AuditTrail';
import { getStocks, createStock, updateStock, deleteStock, getStockById } from '@/services/crudService';
import { getAuditRecordsForEntity } from '@/services/auditService';
import { AuditRecord } from '@/types/audit';

const Stocks = () => {
  const [stocks, setStocks] = useState<StockHolding[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [currentStock, setCurrentStock] = useState<StockHolding | null>(null);
  const [stockToDelete, setStockToDelete] = useState<StockHolding | null>(null);
  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [auditRecords, setAuditRecords] = useState<AuditRecord[]>([]);
  const { toast } = useToast();

  const fetchStocks = async () => {
    try {
      const data = await getStocks();
      setStocks(data);
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
  }, []);

  const totalValue = stocks.reduce((sum, stock) => sum + stock.value, 0);
  const totalInvestment = stocks.reduce(
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
        <Button onClick={handleAddStock}>
          <Plus className="mr-2 h-4 w-4" /> Add Stock
        </Button>
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
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stocks.map((stock) => {
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
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Stock Form Dialog */}
      <StockForm 
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmitStock}
        initialData={currentStock || undefined}
        mode={formMode}
      />

      {/* Delete Confirmation Dialog */}
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

      {/* Audit Trail Dialog */}
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
