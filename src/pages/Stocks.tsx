
import React, { useEffect, useState } from 'react';
import { getStocks } from '@/services/mockData';
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
import { TrendingUp, TrendingDown } from 'lucide-react';

const Stocks = () => {
  const [stocks, setStocks] = useState<StockHolding[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        const data = await getStocks();
        setStocks(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching stocks:', error);
        setLoading(false);
      }
    };

    fetchStocks();
  }, []);

  const totalValue = stocks.reduce((sum, stock) => sum + stock.value, 0);
  const totalInvestment = stocks.reduce(
    (sum, stock) => sum + stock.averageBuyPrice * stock.quantity,
    0
  );
  const totalGain = totalValue - totalInvestment;
  const percentGain = (totalGain / totalInvestment) * 100;

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-lg">Loading stocks data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Stock Portfolio</h1>
        <p className="text-muted-foreground">
          Manage and track your stock investments
        </p>
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
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Stocks;
