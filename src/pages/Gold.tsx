
import React, { useEffect, useState } from 'react';
import { getGoldInvestments } from '@/services/mockData';
import { GoldInvestment } from '@/types';
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
import { format, differenceInMonths } from 'date-fns';
import { Badge } from '@/components/ui/badge';

const Gold = () => {
  const [goldInvestments, setGoldInvestments] = useState<GoldInvestment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGoldInvestments = async () => {
      try {
        const data = await getGoldInvestments();
        setGoldInvestments(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching gold investments:', error);
        setLoading(false);
      }
    };

    fetchGoldInvestments();
  }, []);

  const totalQuantity = goldInvestments.reduce((sum, gold) => {
    // Convert all quantities to grams for total (assuming ETF/SGB units are in gram equivalents)
    return sum + gold.quantity;
  }, 0);
  
  const totalValue = goldInvestments.reduce((sum, gold) => sum + gold.value, 0);
  const totalInvestment = goldInvestments.reduce((sum, gold) => sum + (gold.purchasePrice * gold.quantity), 0);
  const totalGain = totalValue - totalInvestment;
  const percentGain = (totalGain / totalInvestment) * 100;

  const getGoldTypeColor = (type: string) => {
    switch (type) {
      case 'Physical':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100';
      case 'Digital':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100';
      case 'ETF':
        return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100';
      case 'SGB':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-lg">Loading gold investments data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gold Investments</h1>
        <p className="text-muted-foreground">
          Track your gold investments across different forms
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="finance-card">
          <CardHeader className="pb-2">
            <CardTitle>Total Gold</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="stat-value">{totalQuantity.toFixed(2)} grams</div>
          </CardContent>
        </Card>
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
          <CardTitle>Your Gold Investments</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableCaption>Your gold investments in various forms</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Purchase Date</TableHead>
                <TableHead className="text-right">Purchase Price</TableHead>
                <TableHead className="text-right">Current Price</TableHead>
                <TableHead className="text-right">Current Value</TableHead>
                <TableHead className="text-right">Gain/Loss</TableHead>
                <TableHead>Location/Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {goldInvestments.map((gold) => {
                const gain = (gold.currentPrice - gold.purchasePrice) * gold.quantity;
                const gainPercent = (gain / (gold.purchasePrice * gold.quantity)) * 100;
                
                return (
                  <TableRow key={gold.id}>
                    <TableCell>
                      <Badge variant="outline" className={getGoldTypeColor(gold.type)}>
                        {gold.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {gold.quantity} {gold.type === 'ETF' || gold.type === 'SGB' ? 'units' : 'grams'}
                    </TableCell>
                    <TableCell className="text-right">{format(new Date(gold.purchaseDate), 'dd MMM yyyy')}</TableCell>
                    <TableCell className="text-right">₹{gold.purchasePrice.toLocaleString()}</TableCell>
                    <TableCell className="text-right">₹{gold.currentPrice.toLocaleString()}</TableCell>
                    <TableCell className="text-right">₹{gold.value.toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <span className={gain >= 0 ? 'trend-up' : 'trend-down'}>
                        {gain >= 0 ? '+' : ''}₹{gain.toLocaleString()} ({gainPercent.toFixed(2)}%)
                      </span>
                    </TableCell>
                    <TableCell>{gold.location || gold.notes || '-'}</TableCell>
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

export default Gold;
