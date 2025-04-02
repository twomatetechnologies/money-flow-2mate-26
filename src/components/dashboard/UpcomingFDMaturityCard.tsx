
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FixedDeposit } from '@/types';
import { format, differenceInDays } from 'date-fns';
import { Link } from 'react-router-dom';

interface UpcomingFDMaturityCardProps {
  fixedDeposits: FixedDeposit[];
}

export function UpcomingFDMaturityCard({ fixedDeposits }: UpcomingFDMaturityCardProps) {
  // Sort FDs by maturity date and get the upcoming ones
  const sortedFDs = [...fixedDeposits].sort((a, b) => 
    new Date(a.maturityDate).getTime() - new Date(b.maturityDate).getTime()
  );
  
  // Get only FDs that are maturing within the next 90 days
  const upcomingFDs = sortedFDs.filter(fd => 
    differenceInDays(new Date(fd.maturityDate), new Date()) <= 90 &&
    differenceInDays(new Date(fd.maturityDate), new Date()) >= 0
  );

  const totalFDValue = fixedDeposits.reduce((sum, fd) => sum + fd.principal, 0);

  return (
    <Card className="finance-card">
      <CardHeader className="pb-2">
        <CardTitle>Upcoming FD Maturities</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="stat-value">₹{totalFDValue.toLocaleString()}</div>
          <div className="stat-label">Total Fixed Deposits</div>
        </div>
        
        {upcomingFDs.length > 0 ? (
          <div className="space-y-3">
            {upcomingFDs.map(fd => (
              <div key={fd.id} className="flex items-center justify-between">
                <div className="flex flex-col">
                  <div className="font-medium">{fd.bankName}</div>
                  <div className="text-xs text-finance-gray">
                    {format(new Date(fd.maturityDate), 'dd MMM yyyy')}
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="font-medium">₹{fd.maturityAmount.toLocaleString()}</div>
                  <div className="text-xs text-finance-gray">
                    {differenceInDays(new Date(fd.maturityDate), new Date())} days left
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-6 text-center text-finance-gray">
            No FDs maturing in the next 90 days
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button className="w-full" variant="outline" asChild>
          <Link to="/fixed-deposits">Manage Fixed Deposits</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
