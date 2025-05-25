import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarClock, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { FixedDeposit } from '@/types';
import { Badge } from '@/components/ui/badge';

interface UpcomingFDMaturityCardProps {
  fixedDeposits: FixedDeposit[];
}

const UpcomingFDMaturityCard = ({ fixedDeposits }: UpcomingFDMaturityCardProps) => {
  const navigate = useNavigate();
  const [upcomingFDs, setUpcomingFDs] = useState<FixedDeposit[]>([]);

  useEffect(() => {
    const now = new Date();
    const next30Days = new Date();
    next30Days.setDate(now.getDate() + 30);

    const filteredFDs = fixedDeposits
      .filter(fd => {
        if (!fd.maturity_date) return false;
        const maturityDate = new Date(fd.maturity_date);
        return maturityDate >= now && maturityDate <= next30Days;
      })
      .sort((a, b) => new Date(a.maturity_date).getTime() - new Date(b.maturity_date).getTime());
    
    setUpcomingFDs(filteredFDs.slice(0, 3)); // Show top 3 upcoming
  }, [fixedDeposits]);

  if (upcomingFDs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CalendarClock className="h-5 w-5 mr-2 text-primary" />
            Upcoming FD Maturities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No Fixed Deposits maturing in the next 30 days.</p>
           <Button size="sm" className="mt-4" onClick={() => navigate('/fixed-deposits')}>
            <Plus className="h-4 w-4 mr-2" />
            Add Fixed Deposit
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <CalendarClock className="h-5 w-5 mr-2 text-primary" />
          Upcoming FD Maturities (Next 30 Days)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {upcomingFDs.map(fd => (
            <li key={fd.id} className="p-3 bg-muted/20 rounded-md border">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-sm">{fd.bank_name} (Acc: ...{String(fd.account_number).slice(-4)})</span>
                <Badge variant="outline" className="text-xs">
                  Matures: {new Date(fd.maturity_date).toLocaleDateString()}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Amount: ₹{(Number(fd.maturity_amount) || Number(fd.amount) || 0).toLocaleString('en-IN')}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Days to maturity: {Math.ceil((new Date(fd.maturity_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}
              </p>
            </li>
          ))}
        </ul>
        {fixedDeposits.length > upcomingFDs.length && (
            <Button variant="link" size="sm" className="mt-3 px-0" onClick={() => navigate('/fixed-deposits')}>
            View all FDs
            </Button>
        )}
         {fixedDeposits.length === 0 && upcomingFDs.length === 0 && (
             <Button size="sm" className="mt-4" onClick={() => navigate('/fixed-deposits')}>
                <Plus className="h-4 w-4 mr-2" />
                Add Fixed Deposit
            </Button>
         )}
      </CardContent>
    </Card>
  );
};

export default UpcomingFDMaturityCard;
