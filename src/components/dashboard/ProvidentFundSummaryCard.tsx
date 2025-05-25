import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Landmark, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ProvidentFund } from '@/types';

interface ProvidentFundSummaryCardProps {
  providentFunds: ProvidentFund[];
}

const ProvidentFundSummaryCard = ({ providentFunds }: ProvidentFundSummaryCardProps) => {
  const navigate = useNavigate();
  const totalBalance = providentFunds.reduce((sum, pf) => sum + (Number(pf.total_balance) || 0), 0);
  const totalMonthlyContribution = providentFunds.reduce((sum, pf) => sum + (Number(pf.monthly_contribution) || 0), 0);
  
  const weightedInterestSum = providentFunds.reduce((sum, pf) => {
    if (pf.total_balance && pf.interest_rate) {
      return sum + (Number(pf.total_balance) * Number(pf.interest_rate));
    }
    return sum;
  }, 0);
  const totalBalanceWithInterest = providentFunds.reduce((sum, pf) => {
     if (pf.total_balance && pf.interest_rate) {
      return sum + Number(pf.total_balance);
    }
    return sum;
  }, 0)
  const averageInterestRate = totalBalanceWithInterest > 0 ? weightedInterestSum / totalBalanceWithInterest : 0;


  if (providentFunds.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Landmark className="h-5 w-5 mr-2 text-primary" />
            Provident Fund (PF)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No Provident Fund accounts found.</p>
          <Button size="sm" className="mt-4" onClick={() => navigate('/provident-fund')}>
            <Plus className="h-4 w-4 mr-2" />
            Add PF Account
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Landmark className="h-5 w-5 mr-2 text-primary" />
          Provident Fund (PF) Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Total Balance:</span>
            <span className="text-lg font-semibold">₹{totalBalance.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Total Monthly Contribution:</span>
            <span className="text-md">₹{totalMonthlyContribution.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Average Interest Rate:</span>
            <span className="text-md">{averageInterestRate.toFixed(2)}%</span>
          </div>
        </div>
        <Button size="sm" className="mt-6 w-full" onClick={() => navigate('/provident-fund')}>
          View Details
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProvidentFundSummaryCard;
