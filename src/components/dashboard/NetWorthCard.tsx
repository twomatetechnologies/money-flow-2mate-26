
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { NetWorthData } from '@/types';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

interface NetWorthCardProps {
  data: NetWorthData;
}

export function NetWorthCard({ data }: NetWorthCardProps) {
  const chartData = data.history.map(item => ({
    date: format(new Date(item.date), 'MMM yyyy'),
    value: item.value
  }));

  const percentChange = ((data.history[data.history.length - 1].value - data.history[0].value) / data.history[0].value) * 100;
  const isPositive = percentChange >= 0;

  return (
    <Card className="finance-card">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <span>Net Worth</span>
          <div className="flex items-center">
            <span className={`text-sm font-medium ${isPositive ? 'trend-up' : 'trend-down'}`}>
              {isPositive ? '+' : ''}{percentChange.toFixed(2)}%
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="stat-value">₹{data.total.toLocaleString()}</div>
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
                formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Value']}
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
