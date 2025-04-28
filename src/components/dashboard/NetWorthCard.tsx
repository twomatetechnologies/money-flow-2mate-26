
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { NetWorthData } from '@/types';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { formatIndianNumber } from '@/lib/utils';
import { CircleDollarSign, HelpCircle } from 'lucide-react';
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NetWorthCardProps {
  data: NetWorthData;
}

export function NetWorthCard({ data }: NetWorthCardProps) {
  const chartData = data.history.map(item => ({
    date: format(new Date(item.date), 'MMM yyyy'),
    value: item.value
  }));

  // Calculate percentage change between first and last history point
  const firstValue = data.history.length > 0 ? data.history[0].value : 0;
  const lastValue = data.history.length > 0 ? data.history[data.history.length - 1].value : 0;
  const percentChange = firstValue > 0 ? ((lastValue - firstValue) / firstValue) * 100 : 0;
  const isPositive = percentChange >= 0;

  return (
    <Card className="finance-card">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CircleDollarSign className="h-5 w-5" />
            <span>Net Worth</span>
            <TooltipProvider>
              <UITooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-sm">
                  <p>Net Worth = Sum of all your assets (Stocks + Fixed Deposits + SIP Investments + Gold + Provident Fund)</p>
                  <p className="mt-2">This represents your total financial value and is a key indicator of financial health.</p>
                </TooltipContent>
              </UITooltip>
            </TooltipProvider>
          </div>
          <div className="flex items-center">
            <span className={`text-sm font-medium ${isPositive ? 'trend-up' : 'trend-down'}`}>
              {isPositive ? '+' : ''}{percentChange.toFixed(2)}%
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="stat-value">{formatIndianNumber(data.total)}</div>
          <div className="stat-label">Total Assets</div>
        </div>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <defs>
                <linearGradient id="netWorthGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2C7A7B" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#2C7A7B" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 10 }} 
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                tick={{ fontSize: 10 }} 
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `₹${(value / 1000)}k`}
              />
              <Tooltip 
                formatter={(value: number) => [formatIndianNumber(value), 'Value']}
                labelFormatter={(label) => `${label}`}
                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#2C7A7B" 
                fillOpacity={1} 
                fill="url(#netWorthGradient)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
