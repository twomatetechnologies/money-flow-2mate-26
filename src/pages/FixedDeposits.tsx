
import React, { useEffect, useState } from 'react';
import { getFixedDeposits } from '@/services/mockData';
import { FixedDeposit } from '@/types';
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
import { format, differenceInDays } from 'date-fns';

const FixedDeposits = () => {
  const [fixedDeposits, setFixedDeposits] = useState<FixedDeposit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFixedDeposits = async () => {
      try {
        const data = await getFixedDeposits();
        setFixedDeposits(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching fixed deposits:', error);
        setLoading(false);
      }
    };

    fetchFixedDeposits();
  }, []);

  const totalPrincipal = fixedDeposits.reduce((sum, fd) => sum + fd.principal, 0);
  const totalMaturityAmount = fixedDeposits.reduce((sum, fd) => sum + fd.maturityAmount, 0);
  const totalInterest = totalMaturityAmount - totalPrincipal;

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-lg">Loading fixed deposits data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Fixed Deposits</h1>
        <p className="text-muted-foreground">
          Track your fixed deposits across different banks
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="finance-card">
          <CardHeader className="pb-2">
            <CardTitle>Total Principal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="stat-value">₹{totalPrincipal.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card className="finance-card">
          <CardHeader className="pb-2">
            <CardTitle>Total Interest</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="stat-value">₹{totalInterest.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card className="finance-card">
          <CardHeader className="pb-2">
            <CardTitle>Maturity Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="stat-value">₹{totalMaturityAmount.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="finance-card">
        <CardHeader>
          <CardTitle>Your Fixed Deposits</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableCaption>Your fixed deposits across different banks</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Bank</TableHead>
                <TableHead>Account Number</TableHead>
                <TableHead className="text-right">Principal</TableHead>
                <TableHead className="text-right">Interest Rate</TableHead>
                <TableHead className="text-right">Start Date</TableHead>
                <TableHead className="text-right">Maturity Date</TableHead>
                <TableHead className="text-right">Days Left</TableHead>
                <TableHead className="text-right">Maturity Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fixedDeposits.map((fd) => {
                const daysLeft = differenceInDays(new Date(fd.maturityDate), new Date());
                
                return (
                  <TableRow key={fd.id}>
                    <TableCell className="font-medium">{fd.bankName}</TableCell>
                    <TableCell>{fd.accountNumber}</TableCell>
                    <TableCell className="text-right">₹{fd.principal.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{fd.interestRate}%</TableCell>
                    <TableCell className="text-right">{format(new Date(fd.startDate), 'dd MMM yyyy')}</TableCell>
                    <TableCell className="text-right">{format(new Date(fd.maturityDate), 'dd MMM yyyy')}</TableCell>
                    <TableCell className="text-right">{daysLeft > 0 ? daysLeft : 'Matured'}</TableCell>
                    <TableCell className="text-right">₹{fd.maturityAmount.toLocaleString()}</TableCell>
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

export default FixedDeposits;
