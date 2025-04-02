
import React, { useEffect, useState } from 'react';
import { getSIPInvestments } from '@/services/mockData';
import { SIPInvestment } from '@/types';
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

const SIPInvestments = () => {
  const [sipInvestments, setSIPInvestments] = useState<SIPInvestment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSIPInvestments = async () => {
      try {
        const data = await getSIPInvestments();
        setSIPInvestments(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching SIP investments:', error);
        setLoading(false);
      }
    };

    fetchSIPInvestments();
  }, []);

  const totalInvested = sipInvestments.reduce((sum, sip) => {
    const months = differenceInMonths(new Date(), new Date(sip.startDate));
    return sum + (sip.amount * months);
  }, 0);
  
  const totalCurrentValue = sipInvestments.reduce((sum, sip) => sum + sip.currentValue, 0);
  const totalReturns = totalCurrentValue - totalInvested;
  const averageReturnsPercent = totalInvested > 0 ? (totalReturns / totalInvested) * 100 : 0;

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-lg">Loading SIP investments data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">SIP Investments</h1>
        <p className="text-muted-foreground">
          Track your Systematic Investment Plans
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="finance-card">
          <CardHeader className="pb-2">
            <CardTitle>Total Invested</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="stat-value">₹{totalInvested.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card className="finance-card">
          <CardHeader className="pb-2">
            <CardTitle>Current Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="stat-value">₹{totalCurrentValue.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card className="finance-card">
          <CardHeader className="pb-2">
            <CardTitle>Total Returns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`stat-value ${totalReturns >= 0 ? 'trend-up' : 'trend-down'}`}>
              {totalReturns >= 0 ? '+' : ''}₹{totalReturns.toLocaleString()} ({averageReturnsPercent.toFixed(2)}%)
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="finance-card">
        <CardHeader>
          <CardTitle>Your SIP Investments</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableCaption>Your systematic investment plans</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Monthly Amount</TableHead>
                <TableHead className="text-right">Start Date</TableHead>
                <TableHead className="text-right">Duration</TableHead>
                <TableHead className="text-right">Current Value</TableHead>
                <TableHead className="text-right">Returns</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sipInvestments.map((sip) => {
                const months = differenceInMonths(new Date(), new Date(sip.startDate));
                const invested = sip.amount * months;
                
                return (
                  <TableRow key={sip.id}>
                    <TableCell className="font-medium">{sip.name}</TableCell>
                    <TableCell>{sip.type}</TableCell>
                    <TableCell className="text-right">₹{sip.amount.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{format(new Date(sip.startDate), 'dd MMM yyyy')}</TableCell>
                    <TableCell className="text-right">
                      {sip.duration ? `${sip.duration} months` : 'Ongoing'}
                    </TableCell>
                    <TableCell className="text-right">₹{sip.currentValue.toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <span className={sip.returns >= 0 ? 'trend-up' : 'trend-down'}>
                        {sip.returns >= 0 ? '+' : ''}₹{sip.returns.toLocaleString()} ({sip.returnsPercent.toFixed(2)}%)
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

export default SIPInvestments;
