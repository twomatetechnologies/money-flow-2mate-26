import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Stock } from '@/types'; // Changed from StockHolding

interface StockSummaryCardProps {
  stocks: Stock[]; // Changed from StockHolding
}

const StockSummaryCard = ({ stocks }: StockSummaryCardProps) => {
  // Calculations
  const totalInvestment = stocks.reduce((sum, stock) => sum + (Number(stock.purchase_price) * Number(stock.quantity)), 0);
  const totalCurrentValue = stocks.reduce((sum, stock) => {
    const currentPrice = stock.current_price ?? stock.purchase_price; // Fallback to purchase price if current not available
    return sum + (Number(currentPrice) * Number(stock.quantity));
  }, 0);
  const overallGainLoss = totalCurrentValue - totalInvestment;
  const overallGainLossPercent = totalInvestment > 0 ? (overallGainLoss / totalInvestment) * 100 : 0;
  
  const navigate = useNavigate();

  if (stocks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-primary" />
            Stocks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No stock investments found.</p>
          <Button size="sm" className="mt-4" onClick={() => navigate('/stocks')}>
            <Plus className="h-4 w-4 mr-2" />
            Add Stocks
          </Button>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <TrendingUp className="h-5 w-5 mr-2 text-primary" />
          Stock Portfolio Snapshot
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Total Investment:</span>
            <span className="text-md">₹{totalInvestment.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Current Value:</span>
            <span className="text-lg font-semibold">₹{totalCurrentValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Overall Gain/Loss:</span>
            <span className={`text-md font-medium ${overallGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {overallGainLoss >= 0 ? '+' : ''}₹{Math.abs(overallGainLoss).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              ({overallGainLossPercent.toFixed(2)}%)
            </span>
          </div>
        </div>
        <Button size="sm" className="mt-6 w-full" onClick={() => navigate('/stocks')}>
          View Portfolio
        </Button>
      </CardContent>
    </Card>
  );
};

export default StockSummaryCard;
