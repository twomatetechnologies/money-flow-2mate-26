
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FixedDeposit } from '@/types';
import { format, differenceInDays } from 'date-fns';
import { Link } from 'react-router-dom';
import { formatIndianNumber } from '@/lib/utils';
import { getFixedDeposits } from '@/services/fixedDepositService';
import { handleError } from '@/utils/errorHandler';

interface UpcomingFDMaturityCardProps {
  fixedDeposits?: FixedDeposit[];
}

export function UpcomingFDMaturityCard({ fixedDeposits: propFixedDeposits }: UpcomingFDMaturityCardProps) {
  const [fixedDeposits, setFixedDeposits] = useState<FixedDeposit[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (propFixedDeposits) {
      setFixedDeposits(propFixedDeposits);
    } else {
      loadFixedDeposits();
    }
  }, [propFixedDeposits]);

  const loadFixedDeposits = async () => {
    setIsLoading(true);
    try {
      const data = await getFixedDeposits();
      setFixedDeposits(data);
    } catch (error) {
      handleError(error, 'Failed to load fixed deposit data');
    } finally {
      setIsLoading(false);
    }
  };
  
  const sortedFDs = [...fixedDeposits].sort((a, b) => 
    new Date(a.maturityDate).getTime() - new Date(b.maturityDate).getTime()
  );
  
  const upcomingFDs = sortedFDs.filter(fd => 
    differenceInDays(new Date(fd.maturityDate), new Date()) <= 90 &&
    differenceInDays(new Date(fd.maturityDate), new Date()) >= 0
  );

  const totalFDValue = fixedDeposits.reduce((sum, fd) => sum + fd.principal, 0);

  return (
    <Card className="finance-card h-full">
      <CardHeader className="pb-2">
        <CardTitle>Upcoming FD Maturities</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="py-6 text-center">
            Loading fixed deposits...
          </div>
        ) : (
          <>
            <div className="mb-4">
              <div className="stat-value">{formatIndianNumber(totalFDValue)}</div>
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
                      <div className="font-medium">{formatIndianNumber(fd.maturityAmount)}</div>
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
          </>
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
