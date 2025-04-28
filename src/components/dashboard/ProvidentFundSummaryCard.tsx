
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProvidentFund } from '@/types';
import { Link } from 'react-router-dom';
import { formatIndianNumber } from '@/lib/utils';
import { getProvidentFunds } from '@/services/providentFundService';
import { handleError } from '@/utils/errorHandler';
import { PiggyBank } from 'lucide-react';

interface ProvidentFundSummaryCardProps {
  providentFunds?: ProvidentFund[];
}

export function ProvidentFundSummaryCard({ providentFunds: propPFs }: ProvidentFundSummaryCardProps) {
  const [providentFunds, setProvidentFunds] = useState<ProvidentFund[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (propPFs) {
      setProvidentFunds(propPFs);
    } else {
      loadProvidentFunds();
    }
  }, [propPFs]);

  const loadProvidentFunds = async () => {
    setIsLoading(true);
    try {
      const data = await getProvidentFunds();
      setProvidentFunds(data);
    } catch (error) {
      handleError(error, 'Failed to load provident fund data');
    } finally {
      setIsLoading(false);
    }
  };

  const totalBalance = providentFunds.reduce((sum, pf) => sum + pf.totalBalance, 0);
  const totalMonthlyContribution = providentFunds.reduce((sum, pf) => sum + pf.monthlyContribution, 0);
  const avgInterestRate = providentFunds.length > 0 
    ? (providentFunds.reduce((sum, pf) => sum + pf.interestRate, 0) / providentFunds.length).toFixed(2) 
    : "0.00";

  return (
    <Card className="finance-card h-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center">
          <PiggyBank className="h-5 w-5 mr-2" />
          Provident Fund Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="py-6 text-center">
            Loading provident fund data...
          </div>
        ) : (
          <>
            <div className="mb-4">
              <div className="stat-value">₹{formatIndianNumber(totalBalance)}</div>
              <div className="stat-label">Total PF Balance</div>
            </div>
            
            {providentFunds.length > 0 ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div>Monthly Contribution:</div>
                  <div className="font-semibold">₹{formatIndianNumber(totalMonthlyContribution)}</div>
                </div>
                <div className="flex justify-between items-center">
                  <div>Average Interest Rate:</div>
                  <div className="font-semibold">{avgInterestRate}%</div>
                </div>
                <div className="flex justify-between items-center">
                  <div>Number of PF Accounts:</div>
                  <div className="font-semibold">{providentFunds.length}</div>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-finance-gray">
                No provident fund accounts found
              </div>
            )}
          </>
        )}
      </CardContent>
      <CardFooter>
        <Button className="w-full" variant="outline" asChild>
          <Link to="/provident-fund">Manage Provident Fund</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
